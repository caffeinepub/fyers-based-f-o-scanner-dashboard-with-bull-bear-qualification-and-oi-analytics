import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetIndexPerformance, type IndexPerformance } from '../../hooks/useIndexPerformance';
import { TrendingUp, TrendingDown } from 'lucide-react';

const INDEX_DISPLAY_NAMES: Record<string, string> = {
  'NIFTY50': 'Nifty 50',
  'BANKNIFTY': 'Bank Nifty',
  'NIFTYMIDSELECT': 'Nifty Mid Select',
  'SENSEX': 'Sensex',
  'FINNIFTY': 'Fin Nifty',
  'NIFTYPVTBANK': 'Nifty Pvt Bank',
  'NIFTYPSUBANK': 'Nifty PSU Bank',
  'NIFTYIT': 'Nifty IT',
  'NIFTYPHARMA': 'Nifty Pharma',
  'NIFTYFMCG': 'Nifty FMCG',
  'NIFTYAUTO': 'Nifty Auto',
  'NIFTYMETAL': 'Nifty Metal',
  'NIFTYENERGY': 'Nifty Energy',
  'NIFTYREALTY': 'Nifty Realty',
};

export default function IndexPerformanceSnapshot() {
  const { data: indexData, isLoading, error } = useGetIndexPerformance();

  // Sort by % change descending (highest first)
  const sortedData = [...(indexData || [])].sort((a, b) => {
    const aChange = a.changePercent ?? -Infinity;
    const bChange = b.changePercent ?? -Infinity;
    return bChange - aChange;
  });

  const formatChange = (changePercent?: number) => {
    if (changePercent === undefined || changePercent === null) {
      return <span className="text-muted-foreground text-sm">Unavailable</span>;
    }
    
    const isPositive = changePercent >= 0;
    const color = isPositive ? 'text-success' : 'text-destructive';
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center gap-1.5 font-medium ${color}`}>
        <Icon className="h-4 w-4" />
        <span>{changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Index Performance</CardTitle>
        <CardDescription>
          Real-time performance of major indices sorted by % change
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading index data...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Failed to load index performance. Please try again later.
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No index data available.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Index</TableHead>
                  <TableHead className="text-right">% Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((index) => (
                  <TableRow key={index.name}>
                    <TableCell className="font-medium">
                      {INDEX_DISPLAY_NAMES[index.name] || index.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatChange(index.changePercent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
