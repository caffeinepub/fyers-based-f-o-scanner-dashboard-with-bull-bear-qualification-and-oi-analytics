import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Results, Time } from '../backend';

export function useGetResults() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Results | null>({
    queryKey: ['scanResults'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getResults();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetLastScanTimestamp() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Time | null>({
    queryKey: ['lastScanTimestamp'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLastScanTimestamp();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRunNewScan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.runNewScan();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanResults'] });
      queryClient.invalidateQueries({ queryKey: ['lastScanTimestamp'] });
    },
  });
}
