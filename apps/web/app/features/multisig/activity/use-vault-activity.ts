import { useQueries } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';
import { createBlockchainActivityViewsQuery } from '~/queries/activity/blockchain-activity.query';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { AuthNetworkId, MarketData } from '@leather.io/models';
import { getMultisigService, getStacksProtocolService } from '@leather.io/services';
import { isDefined } from '@leather.io/utils';

import { useMultisigNetworks } from '../auth/use-multisig-networks';
import { useSession } from '../auth/use-session';
import { createMultisigAccountAddresses } from '../vaults/multisig-account-addresses';
import { retryMultisigQuery } from '../vaults/use-vaults';
import { multisigVaultKeys } from '../vaults/vault-query-keys';
import {
  type ActivityAccount,
  buildClassifications,
  buildContractActionTargets,
  buildVaultMultisigTransactions,
  collectContractAddresses,
  decodeContractCallPayloads,
} from './build-multisig-activity-inputs';
import {
  type OnchainActivityItem,
  type VaultActivityItem,
  type VaultMultisigTransaction,
  harmonizeVaultActivity,
  selectTransactionIdsNeedingPayload,
} from './harmonize-vault-activity';
import type { MultisigActivityClassification } from './multisig-transaction-activity-view';

const transactionsPageRequest = { page: 1, pageSize: 100 };

const previewActivityLimit = 15;

const protocolRegistryCacheOptions = { staleTime: 300_000, gcTime: 300_000 } as const;

interface MultisigActivityInputs {
  multisigTransactions: VaultMultisigTransaction[];
  payloadsById: Map<string, string>;
  marketData: { btc?: MarketData; stx?: MarketData };
  classifyContract(
    contractId: string,
    functionName: string
  ): MultisigActivityClassification | undefined;
  isLoading: boolean;
}

export function useMultisigActivityInputs(
  accounts: ActivityAccount[],
  onchain: OnchainActivityItem[],
  vaultNamesById?: ReadonlyMap<string, string>
): MultisigActivityInputs {
  const settings = useUserSettings();
  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const btcMarketData = useMarketDataQuery(btcAsset);
  const stxMarketData = useMarketDataQuery(stxAsset);

  function sessionForNetwork(network: AuthNetworkId) {
    return network.startsWith('btc') ? btcSession : stxSession;
  }

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

  const multisigTransactions = buildVaultMultisigTransactions(
    accounts,
    summaryResults.map(result => result.data?.data ?? []),
    vaultNamesById
  );

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

  const decodedContractCalls = decodeContractCallPayloads(multisigTransactions, payloadsById);

  const contractAddresses = collectContractAddresses(decodedContractCalls);

  const protocolResults = useQueries({
    queries: contractAddresses.map(address => ({
      queryKey: ['stacks-protocol-by-address', settings.network.id, address],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getStacksProtocolService().getProtocolByAddress(address, signal),
      ...protocolRegistryCacheOptions,
    })),
  });
  const protocolByAddress = new Map(
    contractAddresses.map((address, index) => [address, protocolResults[index]?.data ?? null])
  );

  const actionTargets = buildContractActionTargets(decodedContractCalls, protocolByAddress);

  const actionResults = useQueries({
    queries: actionTargets.map(target => ({
      queryKey: [
        'stacks-protocol-action',
        settings.network.id,
        target.protocol.id,
        target.contractName,
        target.functionName,
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getStacksProtocolService().getContractActionType(
          target.protocol.id,
          target.contractName,
          target.functionName,
          signal
        ),
      ...protocolRegistryCacheOptions,
    })),
  });

  const classifications = buildClassifications(
    actionTargets,
    actionResults.map(result => result.data)
  );

  function classifyContract(contractId: string, functionName: string) {
    return classifications.get(`${contractId}|${functionName}`);
  }

  const isLoading =
    (accounts.length > 0 && summaryResults.some(result => result.isLoading)) ||
    payloadResults.some(result => result.isLoading) ||
    protocolResults.some(result => result.isLoading) ||
    actionResults.some(result => result.isLoading) ||
    btcMarketData.isLoading ||
    stxMarketData.isLoading;

  return {
    multisigTransactions,
    payloadsById,
    marketData: { btc: btcMarketData.data, stx: stxMarketData.data },
    classifyContract,
    isLoading,
  };
}

interface UseVaultActivityResult {
  items: VaultActivityItem[];
  isLoading: boolean;
}

export function useVaultActivity(
  accounts: ActivityAccount[],
  vaultNamesById?: ReadonlyMap<string, string>
): UseVaultActivityResult {
  const settings = useUserSettings();

  const onchainResults = useQueries({
    queries: accounts.map(account =>
      createBlockchainActivityViewsQuery(
        createMultisigAccountAddresses(account),
        settings,
        previewActivityLimit
      )
    ),
  });
  const onchain = onchainResults.flatMap((result, index) =>
    (result.data ?? []).map(view => ({
      view,
      vaultId: accounts[index].vaultId,
      vaultAccountId: accounts[index].id,
    }))
  );

  const {
    multisigTransactions,
    payloadsById,
    marketData,
    classifyContract,
    isLoading: isLoadingInputs,
  } = useMultisigActivityInputs(accounts, onchain, vaultNamesById);

  const items = harmonizeVaultActivity({
    onchain,
    multisigTransactions,
    payloadsById,
    marketData,
    classifyContract,
  });

  const isAwaitingOnchain =
    accounts.length > 0 &&
    onchainResults.some(result => result.data === undefined && !result.isError);

  return { items, isLoading: isAwaitingOnchain || isLoadingInputs };
}
