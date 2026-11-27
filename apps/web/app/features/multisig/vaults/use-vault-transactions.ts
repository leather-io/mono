import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import type {
  AuthNetworkId,
  MultisigTransaction,
  MultisigTransactionSummary,
} from '@leather.io/models';
import { type MultisigService, getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { multisigProposalsRefetchInterval, retryMultisigQuery } from './use-vaults';
import { multisigVaultKeys } from './vault-query-keys';

const transactionsPageRequest = { page: 1, pageSize: 100 };

type AccountTransactionsPage = Awaited<ReturnType<MultisigService['listVaultAccountTransactions']>>;

export function accountTransactionsQuery(
  network: AuthNetworkId,
  address: string | undefined,
  accountId: string | undefined
) {
  return {
    queryKey: multisigVaultKeys.accountTransactions(network, address, accountId),
    queryFn({ signal }: { signal: AbortSignal }): Promise<AccountTransactionsPage> {
      if (!accountId) throw new Error('Account transactions require an account ID');
      return getMultisigService().listVaultAccountTransactions(
        network,
        accountId,
        transactionsPageRequest,
        signal
      );
    },
    enabled: Boolean(address && accountId),
    retry: retryMultisigQuery,
    refetchInterval: multisigProposalsRefetchInterval,
  };
}

export function useAccountTransactions(
  network: AuthNetworkId,
  accountId: string | undefined
): UseQueryResult<AccountTransactionsPage> {
  const session = useSession(network);
  return useQuery(accountTransactionsQuery(network, session?.identity.address, accountId));
}

export function findBlockingProposal(
  queued: MultisigTransaction | undefined,
  proposals: readonly MultisigTransactionSummary[] | undefined
) {
  if (queued?.status !== 'queued') return;
  const active = proposals?.filter(
    proposal =>
      proposal.id !== queued.id &&
      proposal.vaultAccountId === queued.vaultAccountId &&
      proposal.network === queued.network &&
      (proposal.status === 'pending' || proposal.status === 'signed')
  );
  if (active?.length === 1) return active[0];
}

export function useMultisigTransaction(network: AuthNetworkId, txId: string | undefined) {
  const session = useSession(network);
  return useQuery({
    queryKey: multisigVaultKeys.transaction(network, session?.identity.address, txId),
    queryFn({ signal }) {
      if (!txId) throw new Error('useMultisigTransaction requires a txId');
      return getMultisigService().getTransaction(network, txId, signal);
    },
    enabled: Boolean(session) && Boolean(txId),
    retry: retryMultisigQuery,
    refetchInterval: multisigProposalsRefetchInterval,
  });
}
