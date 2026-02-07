interface OiMetricsCellProps {
  oiChange?: number | null;
  type: 'ATM' | '2-ITM';
}

export default function OiMetricsCell({ oiChange, type }: OiMetricsCellProps) {
  if (oiChange === undefined || oiChange === null) {
    return (
      <div className="text-sm text-muted-foreground">
        Data unavailable
      </div>
    );
  }

  const isPositive = oiChange > 0;
  const isNegative = oiChange < 0;

  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{type}</div>
      <div className={`font-mono text-sm font-medium ${
        isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-foreground'
      }`}>
        {isPositive ? '+' : ''}{oiChange.toFixed(2)}
      </div>
    </div>
  );
}
