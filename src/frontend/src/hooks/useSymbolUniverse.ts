import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetSymbolList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[] | null>({
    queryKey: ['symbolList'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSymbolList();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveSymbolList() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbols: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveSymbolList(symbols);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symbolList'] });
    },
  });
}
