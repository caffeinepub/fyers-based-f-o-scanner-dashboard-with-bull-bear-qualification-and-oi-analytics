import { useState, useMemo } from 'react';
import { useGetResults, useRunNewScan, useGetLastScanTimestamp } from '../hooks/useScanResults';
import { useGetStatus } from '../hooks/useFyersConnection';
import { useGetSymbolList } from '../hooks/useSymbolUniverse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ResultsTable from '../components/results/ResultsTable';
import IndexPerformanceSnapshot from '../components/dashboard/IndexPerformanceSnapshot';
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MIN_SCAN_INTERVAL_MS } from '../constants/scan';
import { Side } from '../backend';

interface DashboardProps {
  onNavigateToSettings?: () => void;
}

export default function Dashboard({ onNavigateToSettings }: DashboardProps = {}) {
  const { data: results, isLoading: resultsLoading } = useGetResults();
  const { data: lastScanTime } = useGetLastScanTimestamp();
  const { data: connectionStatus } = useGetStatus();
  const { data: symbolList } = useGetSymbolList();
  const runScan = useRunNewScan();
  const [lastLocalScanTime, setLastLocalScanTime] = useState<number | null>(null);

  const canRunScan = useMemo(() => {
    if (!lastLocalScanTime) return true;
    const timeSinceLastScan = Date.now() - lastLocalScanTime;
    return timeSinceLastScan >= MIN_SCAN_INTERVAL_MS;
  }, [lastLocalScanTime]);

  const timeUntilNextScan = useMemo(() => {
    if (!lastLocalScanTime || canRunScan) return 0;
    const elapsed = Date.now() - lastLocalScanTime;
    return Math.ceil((MIN_SCAN_INTERVAL_MS - elapsed) / 1000);
  }, [lastLocalScanTime, canRunScan]);

  const handleRunScan = async () => {
    if (!canRunScan) {
      toast.error(`Please wait ${timeUntilNextScan} seconds before running another scan`);
      return;
    }

    try {
      setLastLocalScanTime(Date.now());
      await runScan.mutateAsync();
      toast.success('Scan completed successfully');
    } catch (error: any) {
      console.error('Scan error:', error);
      
      if (error.message?.includes('credentials expired') || error.message?.includes('No Fyers credentials')) {
        toast.error('Fyers connection issue. Please reconnect in Settings.', {
          action: onNavigateToSettings ? {
            label: 'Go to Settings',
            onClick: onNavigateToSettings
          } : undefined
        });
      } else if (error.message?.includes('Rate limit')) {
        toast.error('Rate limit reached. Please wait before scanning again.');
      } else if (error.message?.includes('No symbol list')) {
        toast.error('No symbol list configured. Please upload symbols in Settings.', {
          action: onNavigateToSettings ? {
            label: 'Go to Settings',
            onClick: onNavigateToSettings
          } : undefined
        });
      } else {
        toast.error('Scan failed. Please try again.');
      }
    }
  };

  const formatTimestamp = (timestamp: bigint | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const isNotConnected = connectionStatus === 'NOT_CONNECTED';
  const isExpired = connectionStatus === 'EXPIRED';
  const hasNoSymbols = !symbolList || symbolList.length === 0;

  const bullQualified = results?.qualified.filter(d => d.side === Side.long_) || [];
  const bearQualified = results?.qualified.filter(d => d.side === Side.short_) || [];

  return (
    <div 
      className="container py-8 px-4 relative"
      style={{
        backgroundImage: 'url(/assets/generated/dashboard-bg.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bull/Bear qualification with OI analytics
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {lastScanTime && (
              <div className="text-sm text-muted-foreground">
                Last updated: {formatTimestamp(lastScanTime)}
              </div>
            )}
            <Button
              onClick={handleRunScan}
              disabled={runScan.isPending || !canRunScan}
              size="lg"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${runScan.isPending ? 'animate-spin' : ''}`} />
              {runScan.isPending ? 'Scanning...' : canRunScan ? 'Run Scan' : `Wait ${timeUntilNextScan}s`}
            </Button>
          </div>
        </div>

        {(isNotConnected || isExpired || hasNoSymbols) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {isNotConnected && 'Fyers not connected. '}
                {isExpired && 'Fyers credentials expired. '}
                {hasNoSymbols && 'No symbol list configured. '}
                Please configure in Settings.
              </span>
              {onNavigateToSettings && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onNavigateToSettings}
                  className="ml-4"
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <IndexPerformanceSnapshot />

        <Tabs defaultValue="bull" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="bull" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Bull Qualified ({bullQualified.length})
            </TabsTrigger>
            <TabsTrigger value="bear" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Bear Qualified ({bearQualified.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bull" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bull Qualified Stocks</CardTitle>
                <CardDescription>
                  First 5-min low = day low. Seller POV: Put options
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading results...</div>
                ) : bullQualified.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bull qualified stocks. Run a scan to see results.
                  </div>
                ) : (
                  <ResultsTable data={bullQualified} side="bull" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bear" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bear Qualified Stocks</CardTitle>
                <CardDescription>
                  First 5-min high = day high. Seller POV: Call options
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading results...</div>
                ) : bearQualified.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bear qualified stocks. Run a scan to see results.
                  </div>
                ) : (
                  <ResultsTable data={bearQualified} side="bear" />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
