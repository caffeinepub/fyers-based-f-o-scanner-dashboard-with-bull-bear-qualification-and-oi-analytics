import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FyersConnectionForm from '../components/FyersConnectionForm';
import SymbolUniverseEditor from '../components/SymbolUniverseEditor';
import { Link2, List } from 'lucide-react';

export default function Settings() {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your Fyers connection and symbol universe
          </p>
        </div>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Fyers Connection
            </TabsTrigger>
            <TabsTrigger value="symbols" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Symbol Universe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fyers Connection</CardTitle>
                <CardDescription>
                  Configure your Fyers API credentials to fetch market data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FyersConnectionForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symbols" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Symbol Universe (F&O)</CardTitle>
                <CardDescription>
                  Upload or paste your F&O symbol list for scanning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SymbolUniverseEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
