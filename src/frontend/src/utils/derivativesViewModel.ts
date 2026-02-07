import { Derivative, Status, Side } from '../backend';

export function getStatusLabel(status: Status): string {
  if (status === Status.qualified) return 'Qualified';
  if (status === Status.ignored) return 'Ignored';
  if (status === Status.disqualified) return 'Disqualified';
  return 'Unknown';
}

export function getSideLabel(derivative: Derivative): 'Bull' | 'Bear' | 'Unknown' {
  if (derivative.side === Side.long_) return 'Bull';
  if (derivative.side === Side.short_) return 'Bear';
  return 'Unknown';
}

export function getSellerPovLabel(derivative: Derivative): string {
  const side = getSideLabel(derivative);
  if (side === 'Bull') return 'Put Options';
  if (side === 'Bear') return 'Call Options';
  return 'N/A';
}

export function hasOiData(derivative: Derivative): boolean {
  return derivative.atmOiChange !== undefined && derivative.atmOiChange !== null;
}

export function getFirst5MinLevel(derivative: Derivative, type: 'high' | 'low'): number | null {
  if (derivative.candles.length === 0) return null;
  const firstCandle = derivative.candles[0];
  return type === 'high' ? firstCandle.high : firstCandle.low;
}

export function getDayLevel(derivative: Derivative, type: 'high' | 'low'): number | null {
  if (derivative.candles.length === 0) return null;
  
  if (type === 'high') {
    return Math.max(...derivative.candles.map(c => c.high));
  } else {
    return Math.min(...derivative.candles.map(c => c.low));
  }
}
