import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface IndexPerformance {
  name: string;
  changePercent?: number;
}

const INDEX_NAMES = [
  'NIFTY50',
  'BANKNIFTY',
  'NIFTYMIDSELECT',
  'SENSEX',
  'FINNIFTY',
  'NIFTYPVTBANK',
  'NIFTYPSUBANK',
  'NIFTYIT',
  'NIFTYPHARMA',
  'NIFTYFMCG',
  'NIFTYAUTO',
  'NIFTYMETAL',
  'NIFTYENERGY',
  'NIFTYREALTY',
];

export function useGetIndexPerformance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IndexPerformance[]>({
    queryKey: ['indexPerformance'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Check if the backend method exists
      if (typeof (actor as any).getIndexPerformance !== 'function') {
        // Backend method not yet implemented, return empty array
        console.warn('getIndexPerformance method not available on backend');
        return [];
      }
      
      try {
        return await (actor as any).getIndexPerformance(INDEX_NAMES);
      } catch (error) {
        console.error('Error fetching index performance:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 60000, // Refresh every minute
  });
}
