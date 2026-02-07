import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import QualificationBadge from './QualificationBadge';
import OiMetricsCell from './OiMetricsCell';
import { ArrowUpDown } from 'lucide-react';
import type { Derivative } from '../../backend';

type SortKey = 'symbol' | 'first5min' | 'dayLevel';
type SortDirection = 'asc' | 'desc';

interface ResultsTableProps {
  data: Derivative[];
  side: 'bull' | 'bear';
}

export default function ResultsTable({ data, side }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'first5min':
          const aFirst = a.candles[0];
          const bFirst = b.candles[0];
          if (side === 'bull') {
            comparison = (aFirst?.low || 0) - (bFirst?.low || 0);
          } else {
            comparison = (aFirst?.high || 0) - (bFirst?.high || 0);
          }
          break;
        case 'dayLevel':
          const aDayLow = Math.min(...a.candles.map(c => c.low));
          const aDayHigh = Math.max(...a.candles.map(c => c.high));
          const bDayLow = Math.min(...b.candles.map(c => c.low));
          const bDayHigh = Math.max(...b.candles.map(c => c.high));
          if (side === 'bull') {
            comparison = aDayLow - bDayLow;
          } else {
            comparison = aDayHigh - bDayHigh;
          }
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortKey, sortDirection, side]);

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(column)}
      className="-ml-3 h-8 data-[state=open]:bg-accent"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">
              <SortButton column="symbol" label="Symbol" />
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <SortButton 
                column="first5min" 
                label={side === 'bull' ? 'First 5-min Low' : 'First 5-min High'} 
              />
            </TableHead>
            <TableHead>
              <SortButton 
                column="dayLevel" 
                label={side === 'bull' ? 'Day Low' : 'Day High'} 
              />
            </TableHead>
            <TableHead>ATM OI Change</TableHead>
            <TableHead>2-ITM OI Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((derivative) => {
              const firstCandle = derivative.candles[0];
              const dayLow = derivative.candles.length > 0 
                ? Math.min(...derivative.candles.map(c => c.low))
                : null;
              const dayHigh = derivative.candles.length > 0
                ? Math.max(...derivative.candles.map(c => c.high))
                : null;

              return (
                <TableRow key={derivative.symbol}>
                  <TableCell className="font-medium">{derivative.symbol}</TableCell>
                  <TableCell>
                    <QualificationBadge status={derivative.status} />
                  </TableCell>
                  <TableCell>
                    {firstCandle ? (
                      <span className="font-mono">
                        {side === 'bull' 
                          ? firstCandle.low.toFixed(2)
                          : firstCandle.high.toFixed(2)
                        }
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {side === 'bull' ? (
                      dayLow !== null ? (
                        <span className="font-mono">{dayLow.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )
                    ) : (
                      dayHigh !== null ? (
                        <span className="font-mono">{dayHigh.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    <OiMetricsCell 
                      oiChange={derivative.atmOiChange} 
                      type="ATM"
                    />
                  </TableCell>
                  <TableCell>
                    <OiMetricsCell 
                      oiChange={derivative.itmOiChange[0]} 
                      type="2-ITM"
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
