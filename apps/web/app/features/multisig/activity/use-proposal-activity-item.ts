import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { BlockchainActivityItem } from '@leather.io/features';
import type { MultisigTransaction, VaultAccount } from '@leather.io/models';
import {
  createMarketDataQueryConfig,
  createSip10AssetByPrincipalQueryConfig,
} from '@leather.io/queries';
import { getStacksProtocolService } from '@leather.io/services';

import {
  type DecodedProposalPayload,
  decodeProposalPayload,
} from '../transactions/decode-proposal-payload';
import { buildClassifications, buildContractActionTargets } from './build-multisig-activity-inputs';
import {
  type ProposalTokenInfo,
  createMultisigTransactionActivityItem,
} from './multisig-transaction-activity-view';

const protocolRegistryCacheOptions = { staleTime: 300_000, gcTime: 300_000 } as const;

interface UseProposalActivityItemResult {
  item: BlockchainActivityItem | undefined;
  payload: DecodedProposalPayload | null;
  isLoading: boolean;
}

export function useProposalActivityItem(
  transaction: MultisigTransaction | undefined,
  account: VaultAccount | undefined
): UseProposalActivityItemResult {
  const settings = useUserSettings();
  const context = account
    ? { network: account.network, multisigAddress: account.multisigAddress }
    : undefined;
  const payload =
    context && transaction ? decodeProposalPayload(context, transaction.proposalRawPayload) : null;

  const contractCall = payload?.type === 'contractCall' ? payload : undefined;
  const contractAddress = contractCall?.contractId.split('.')[0];
  const protocolQuery = useQuery({
    queryKey: ['stacks-protocol-by-address', settings.network.id, contractAddress],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getStacksProtocolService().getProtocolByAddress(contractAddress ?? '', signal),
    enabled: Boolean(contractAddress),
    ...protocolRegistryCacheOptions,
  });

  const actionTargets = buildContractActionTargets(
    contractCall ? [contractCall] : [],
    new Map([[contractAddress ?? '', protocolQuery.data ?? null]])
  );
  const target = actionTargets[0];
  const targetProtocolId = target?.protocol.id;
  const targetContractName = target?.contractName;
  const targetFunctionName = target?.functionName;
  const actionQuery = useQuery({
    queryKey: [
      'stacks-protocol-action',
      settings.network.id,
      targetProtocolId,
      targetContractName,
      targetFunctionName,
    ],
    queryFn: ({ signal }: { signal: AbortSignal }) => {
      if (
        targetProtocolId === undefined ||
        targetContractName === undefined ||
        targetFunctionName === undefined
      )
        return null;
      return getStacksProtocolService().getContractActionType(
        targetProtocolId,
        targetContractName,
        targetFunctionName,
        signal
      );
    },
    enabled: targetProtocolId !== undefined,
    ...protocolRegistryCacheOptions,
  });
  const classifications = buildClassifications(actionTargets, [actionQuery.data]);

  const tokenContractId = payload?.type === 'sip10Transfer' ? payload.token.contractId : undefined;
  const tokenAssetQuery = useQuery({
    ...createSip10AssetByPrincipalQueryConfig(tokenContractId ?? '', settings),
    enabled: Boolean(tokenContractId),
  });
  const tokenMarketDataQuery = useQuery({
    ...createMarketDataQueryConfig(tokenAssetQuery.data ?? stxAsset, settings),
    enabled: Boolean(tokenAssetQuery.data),
  });

  const marketData = useMarketDataQuery(context?.network.startsWith('btc') ? btcAsset : stxAsset);

  function classifyContract(contractId: string, functionName: string) {
    return classifications.get(`${contractId}|${functionName}`);
  }

  function getTokenInfo(contractId: string): ProposalTokenInfo | undefined {
    if (!tokenAssetQuery.data || contractId !== tokenContractId) return undefined;
    return { asset: tokenAssetQuery.data, marketData: tokenMarketDataQuery.data };
  }

  const item =
    context && transaction
      ? createMultisigTransactionActivityItem(context, transaction, {
          rawPayload: transaction.proposalRawPayload,
          marketData: marketData.data,
          classifyContract,
          getTokenInfo,
        })
      : undefined;

  const isLoading =
    protocolQuery.isLoading ||
    actionQuery.isLoading ||
    tokenAssetQuery.isLoading ||
    tokenMarketDataQuery.isLoading ||
    marketData.isLoading;

  return { item, payload, isLoading };
}
