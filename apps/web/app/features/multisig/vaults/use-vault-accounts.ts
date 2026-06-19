import { useQuery } from '@tanstack/react-query';

import type { AuthNetworkId } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { retryMultisigQuery } from './use-vaults';
import { multisigVaultKeys } from './vault-query-keys';

export function useVaultAccounts(network: AuthNetworkId, vaultId: string | undefined) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.accounts(network, session?.identity.address, vaultId),
    queryFn: ({ signal }) => {
      if (!vaultId) throw new Error('useVaultAccounts requires a vaultId');
      return getMultisigService().listVaultAccounts(network, vaultId, signal);
    },
    enabled: Boolean(session) && Boolean(vaultId),
    retry: retryMultisigQuery,
  });
}

export function useVaultAccount(network: AuthNetworkId, accountId: string | undefined) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.account(network, session?.identity.address, accountId),
    queryFn: ({ signal }) => {
      if (!accountId) throw new Error('useVaultAccount requires an accountId');
      return getMultisigService().getVaultAccount(network, accountId, signal);
    },
    enabled: Boolean(session) && Boolean(accountId),
    retry: retryMultisigQuery,
  });
}
