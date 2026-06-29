import { useQueries, useQuery } from '@tanstack/react-query';

import type { AuthNetworkId, VaultAccountSummary } from '@leather.io/models';
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

// Aggregates transactions across all of a vault's accounts (one list query per
// account), newest first. The backend only lists per account, so this fans out.
export function useVaultTransactions(
  network: AuthNetworkId,
  accounts: VaultAccountSummary[] | undefined
) {
  const session = useSession(network);
  const list = accounts ?? [];

  const results = useQueries({
    queries: list.map(account => ({
      queryKey: multisigVaultKeys.accountTransactions(
        network,
        session?.identity.address,
        account.id
      ),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getMultisigService().listVaultAccountTransactions(
          network,
          account.id,
          transactionsPageRequest,
          signal
        ),
      enabled: Boolean(session),
      retry: retryMultisigQuery,
    })),
  });

  const transactions = results
    .flatMap(result => result.data?.data ?? [])
    .sort((a, b) => b.proposalTimestamp - a.proposalTimestamp);

  return {
    transactions,
    isLoading: list.length > 0 && results.some(result => result.isLoading),
    isSuccess: list.length === 0 || results.every(result => result.isSuccess),
  };
}

export function useMultisigTransaction(network: AuthNetworkId, txId: string | undefined) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.transaction(network, session?.identity.address, txId),
    queryFn: ({ signal }) => {
      if (!txId) throw new Error('useMultisigTransaction requires a txId');
      return getMultisigService().getTransaction(network, txId, signal);
    },
    enabled: Boolean(session) && Boolean(txId),
    retry: retryMultisigQuery,
  });
}
