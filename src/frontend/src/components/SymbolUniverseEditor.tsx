import { useState, useEffect } from 'react';
import { useGetSymbolList, useSaveSymbolList } from '../hooks/useSymbolUniverse';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SymbolUniverseEditor() {
  const { data: savedSymbols, isLoading } = useGetSymbolList();
  const saveSymbols = useSaveSymbolList();
  const [symbolText, setSymbolText] = useState('');
  const [symbolCount, setSymbolCount] = useState(0);

  useEffect(() => {
    if (savedSymbols) {
      setSymbolText(savedSymbols.join('\n'));
      setSymbolCount(savedSymbols.length);
    }
  }, [savedSymbols]);

  const handleTextChange = (text: string) => {
    setSymbolText(text);
    const symbols = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    setSymbolCount(symbols.length);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleTextChange(text);
      toast.success('File loaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    const symbols = symbolText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (symbols.length === 0) {
      toast.error('Please add at least one symbol');
      return;
    }

    try {
      await saveSymbols.mutateAsync(symbols);
      toast.success(`Saved ${symbols.length} symbols successfully`);
    } catch (error) {
      toast.error('Failed to save symbols. Please try again.');
      console.error('Save symbols error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {symbolCount} symbol{symbolCount !== 1 ? 's' : ''} in list
        </div>
        <div>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            id="symbol-file-upload"
          />
          <Label htmlFor="symbol-file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload .txt File
              </span>
            </Button>
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symbols">Symbols (one per line)</Label>
        <Textarea
          id="symbols"
          placeholder="NIFTY&#10;BANKNIFTY&#10;RELIANCE&#10;TCS&#10;..."
          value={symbolText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Enter F&O symbols, one per line. Empty lines will be ignored.
        </p>
      </div>

      {symbolCount > 100 && (
        <Alert>
          <AlertDescription>
            You have {symbolCount} symbols. Large lists may take longer to scan.
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSave} 
        className="w-full"
        disabled={saveSymbols.isPending || symbolCount === 0}
      >
        <Save className="mr-2 h-4 w-4" />
        {saveSymbols.isPending ? 'Saving...' : 'Save Symbol List'}
      </Button>
    </div>
  );
}
