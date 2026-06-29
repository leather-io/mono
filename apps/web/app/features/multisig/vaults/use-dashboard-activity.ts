import { useQueries } from '@tanstack/react-query';

import type { MultisigTransactionSummary, VaultSummary } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useSession } from '../auth/use-session';
import { retryMultisigQuery } from './use-vaults';
import { multisigVaultKeys } from './vault-query-keys';

const transactionsPageRequest = { page: 1, pageSize: 20 };

export interface DashboardActivityItem {
  transaction: MultisigTransactionSummary;
  vaultId: string;
  vaultName: string;
}

// Aggregates transactions across every active vault's accounts for the dashboard
// feed: a nested fan-out (vault -> accounts -> transactions) over both networks,
// newest first. The backend lists only per account, so this is client-side.
export function useDashboardActivity(vaults: VaultSummary[], limit = 5) {
  const btcSession = useSession('btc:mainnet');
  const stxSession = useSession('stx:mainnet');

  const activeVaults = vaults.filter(
    vault => vault.membershipStatus === 'joined' && vault.status === 'active'
  );

  const accountResults = useQueries({
    queries: activeVaults.map(vault => {
      const address =
        vault.network === 'btc:mainnet'
          ? btcSession?.identity.address
          : stxSession?.identity.address;
      return {
        queryKey: multisigVaultKeys.accounts(vault.network, address, vault.id),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          getMultisigService().listVaultAccounts(vault.network, vault.id, signal),
        enabled: vault.network === 'btc:mainnet' ? Boolean(btcSession) : Boolean(stxSession),
        retry: retryMultisigQuery,
      };
    }),
  });

  const vaultNames = new Map(activeVaults.map(vault => [vault.id, vault.name]));
  const accounts = accountResults.flatMap(result => result.data ?? []);

  const transactionResults = useQueries({
    queries: accounts.map(account => {
      const address =
        account.network === 'btc:mainnet'
          ? btcSession?.identity.address
          : stxSession?.identity.address;
      return {
        queryKey: multisigVaultKeys.accountTransactions(account.network, address, account.id),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          getMultisigService().listVaultAccountTransactions(
            account.network,
            account.id,
            transactionsPageRequest,
            signal
          ),
        retry: retryMultisigQuery,
      };
    }),
  });

  const accountVaultId = new Map(accounts.map(account => [account.id, account.vaultId]));

  const activity: DashboardActivityItem[] = transactionResults
    .flatMap(result => result.data?.data ?? [])
    .sort((a, b) => b.proposalTimestamp - a.proposalTimestamp)
    .slice(0, limit)
    .flatMap(transaction => {
      const vaultId = accountVaultId.get(transaction.vaultAccountId);
      if (!vaultId) return [];
      return [{ transaction, vaultId, vaultName: vaultNames.get(vaultId) ?? '' }];
    });

  const isLoading =
    (activeVaults.length > 0 && accountResults.some(result => result.isLoading)) ||
    (accounts.length > 0 && transactionResults.some(result => result.isLoading));

  return { activity, isLoading };
}
