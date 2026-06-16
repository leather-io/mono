import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import type { AuthNetworkId } from '@leather.io/models';

import { multisigVaultKeys } from '../vaults/vault-query-keys';
import { sessionsAtom } from './sessions.atom';

export function useSignOut(network: AuthNetworkId) {
  const setSessions = useSetAtom(sessionsAtom);
  const queryClient = useQueryClient();
  return useCallback(() => {
    setSessions(prev => ({ ...prev, [network]: null }));
    queryClient.removeQueries({ queryKey: multisigVaultKeys.byNetwork(network) });
  }, [setSessions, queryClient, network]);
}
