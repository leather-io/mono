import { useQueries } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';
import { createBlockchainActivityViewsQuery } from '~/queries/activity/blockchain-activity.query';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { AuthNetworkId, VaultAccountSummary } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';
import { isDefined } from '@leather.io/utils';

import { useMultisigNetworks } from '../auth/use-multisig-networks';
import { useSession } from '../auth/use-session';
import { createMultisigAccountAddresses } from '../vaults/multisig-account-addresses';
import { retryMultisigQuery } from '../vaults/use-vaults';
import { multisigVaultKeys } from '../vaults/vault-query-keys';
import {
  type VaultActivityItem,
  type VaultMultisigTransaction,
  harmonizeVaultActivity,
  selectTransactionIdsNeedingPayload,
} from './harmonize-vault-activity';

const transactionsPageRequest = { page: 1, pageSize: 20 };

interface UseVaultActivityResult {
  items: VaultActivityItem[];
  isLoading: boolean;
}

export function useVaultActivity(
  accounts: VaultAccountSummary[],
  vaultNamesById?: ReadonlyMap<string, string>
): UseVaultActivityResult {
  const settings = useUserSettings();
  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const btcMarketData = useMarketDataQuery(btcAsset);
  const stxMarketData = useMarketDataQuery(stxAsset);

  function sessionForNetwork(network: AuthNetworkId) {
    return network.startsWith('btc') ? btcSession : stxSession;
  }

  const onchainResults = useQueries({
    queries: accounts.map(account =>
      createBlockchainActivityViewsQuery(createMultisigAccountAddresses(account), settings)
    ),
  });

  const summaryResults = useQueries({
    queries: accounts.map(account => {
      const session = sessionForNetwork(account.network);
      return {
        queryKey: multisigVaultKeys.accountTransactions(
          account.network,
          session?.identity.address,
          account.id
        ),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          getMultisigService().listVaultAccountTransactions(
            account.network,
            account.id,
            transactionsPageRequest,
            signal
          ),
        enabled: Boolean(session),
        retry: retryMultisigQuery,
      };
    }),
  });

  const onchain = onchainResults.flatMap(result => result.data ?? []);

  const multisigTransactions: VaultMultisigTransaction[] = accounts.flatMap((account, index) => {
    const summaries = summaryResults[index]?.data?.data ?? [];
    return summaries.map(transaction => ({
      transaction,
      payloadContext: { network: account.network, multisigAddress: account.multisigAddress },
      vaultId: account.vaultId,
      vaultName: vaultNamesById?.get(account.vaultId),
      threshold: account.threshold,
    }));
  });

  const networkById = new Map(
    multisigTransactions.map(({ transaction, payloadContext }) => [
      transaction.id,
      payloadContext.network,
    ])
  );
  const transactionIdsNeedingPayload = selectTransactionIdsNeedingPayload(
    onchain,
    multisigTransactions
  );

  const payloadResults = useQueries({
    queries: transactionIdsNeedingPayload.flatMap(id => {
      const network = networkById.get(id);
      if (!network) return [];
      const session = sessionForNetwork(network);
      return [
        {
          queryKey: multisigVaultKeys.transaction(network, session?.identity.address, id),
          queryFn: ({ signal }: { signal: AbortSignal }) =>
            getMultisigService().getTransaction(network, id, signal),
          enabled: Boolean(session),
          retry: retryMultisigQuery,
        },
      ];
    }),
  });

  const payloadsById = new Map(
    payloadResults
      .map(result => result.data)
      .filter(isDefined)
      .map(transaction => [transaction.id, transaction.proposalRawPayload])
  );

  const items = harmonizeVaultActivity({
    onchain,
    multisigTransactions,
    payloadsById,
    marketData: { btc: btcMarketData.data, stx: stxMarketData.data },
  });

  const isLoading =
    accounts.length > 0 &&
    (onchainResults.some(result => result.isLoading) ||
      summaryResults.some(result => result.isLoading));

  return { items, isLoading };
}
