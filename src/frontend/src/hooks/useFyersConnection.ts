import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Time } from '../backend';

export function useGetStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['fyersStatus'],
    queryFn: async () => {
      if (!actor) return 'NOT_CONNECTED';
      return actor.getStatus();
    },
    enabled: !!actor && !actorFetching,
  });
}

interface SaveCredsParams {
  clientId: string;
  secret: string;
  redirectUrl: string;
  accessToken: string;
  refreshToken: string;
  expiry: Time;
}

export function useSaveCreds() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveCredsParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCreds(
        params.clientId,
        params.secret,
        params.redirectUrl,
        params.accessToken,
        params.refreshToken,
        params.expiry
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fyersStatus'] });
    },
  });
}

export function useClearCreds() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCreds();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fyersStatus'] });
    },
  });
}
