import { useQuery } from '@tanstack/react-query';

import type { AuthNetworkId } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { retryMultisigQuery } from './use-vaults';
import { multisigVaultKeys } from './vault-query-keys';

const transactionsPageRequest = { page: 1, pageSize: 20 };

export function useVaultAccountTransactions(network: AuthNetworkId, accountId: string | undefined) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.accountTransactions(network, session?.identity.address, accountId),
    queryFn: ({ signal }) => {
      if (!accountId) throw new Error('useVaultAccountTransactions requires an accountId');
      return getMultisigService().listVaultAccountTransactions(
        network,
        accountId,
        transactionsPageRequest,
        signal
      );
    },
    enabled: Boolean(session) && Boolean(accountId),
    retry: retryMultisigQuery,
  });
}
