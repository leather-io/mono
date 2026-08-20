import { useQuery } from '@tanstack/react-query';

import type { AuthNetworkId } from '@leather.io/models';
import { LeatherApiError, type ListVaultsFilters, getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { multisigVaultKeys } from './vault-query-keys';

export const multisigProposalsRefetchInterval = 5_000;
export const onchainActivityRefetchInterval = 20_000;

export function retryMultisigQuery(failureCount: number, error: Error) {
  if (
    LeatherApiError.isLeatherApiError(error) &&
    error.status >= 400 &&
    error.status < 500 &&
    ![408, 429].includes(error.status)
  ) {
    return false;
  }
  return failureCount < 3;
}

export function useVaults(network: AuthNetworkId, filters?: ListVaultsFilters) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.list(network, session?.identity.address, filters),
    queryFn: ({ signal }) => getMultisigService().listVaults(network, filters, signal),
    enabled: Boolean(session),
    retry: retryMultisigQuery,
  });
}

export function useVault(network: AuthNetworkId, vaultId: string | undefined) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.detail(network, session?.identity.address, vaultId),
    queryFn: ({ signal }) => {
      if (!vaultId) throw new Error('useVault requires a vaultId');
      return getMultisigService().getVault(network, vaultId, signal);
    },
    enabled: Boolean(session) && Boolean(vaultId),
    retry: retryMultisigQuery,
  });
}
