import { ClientParam } from '@stacks/common';
import { StacksNetwork } from '@stacks/network';
import { StackingClient } from '@stacks/stacking';
import { fetchCallReadOnlyFunction, noneCV, principalCV } from '@stacks/transactions';
import { UseQueryOptions } from '@tanstack/react-query';

import { StackingQueryPrefixes } from '../query-prefixes';

const defaultQueryOptions = {
  refetchOnMount: true,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
} as const;

interface StackingParams {
  client: StackingClient;
}

interface CreateGetTransactionByIdQueryOptionsArgs {
  senderAddress: string | null;
  network: StacksNetwork;
  contractAddress: string;
  contractName: string;
  callingContract: string;
}

export function createGetAllowanceContractCallersQueryOptions({
  senderAddress,
  network,
  contractAddress,
  contractName,
  callingContract,
  client,
}: CreateGetTransactionByIdQueryOptionsArgs & ClientParam) {
  return {
    queryKey: [
      StackingQueryPrefixes.GetAllowanceContractCallers,
      senderAddress,
      callingContract,
      network,
      contractAddress,
      contractName,
    ],
    queryFn: () => {
      if (senderAddress) {
        return fetchCallReadOnlyFunction({
          contractAddress,
          contractName,
          functionName: 'get-allowance-contract-callers',
          functionArgs: [principalCV(senderAddress), principalCV(callingContract)],
          senderAddress,
          network,
          client,
        });
      } else {
        return Promise.resolve(noneCV());
      }
    },
    ...defaultQueryOptions,
  } satisfies UseQueryOptions;
}

export function createGetCycleDurationQueryOptions({ client }: StackingParams) {
  return {
    queryKey: [StackingQueryPrefixes.GetCycleDuration, client],
    queryFn: () => client.getCycleDuration(),
    ...defaultQueryOptions,
  } satisfies UseQueryOptions;
}

export function createGetStatusQueryOptions({ client }: StackingParams) {
  return {
    queryKey: [StackingQueryPrefixes.GetStatus, client],
    queryFn: () => client.getStatus(),
    ...defaultQueryOptions,
  } satisfies UseQueryOptions;
}

export function createGetPoxOperationInfoQueryOptions({ client }: StackingParams) {
  return {
    queryKey: [StackingQueryPrefixes.GetPoxOperationInfo, client],
    queryFn: () => client.getPoxOperationInfo(),
    ...defaultQueryOptions,
  } satisfies UseQueryOptions;
}

export function createGetCoreInfoQueryOptions({ client }: StackingParams) {
  return {
    queryKey: [StackingQueryPrefixes.GetCoreInfo, client],
    queryFn: () => client.getCoreInfo(),
    ...defaultQueryOptions,
  } satisfies UseQueryOptions;
}

export function createGetSecondsUntilNextCycleQueryOptions({ client }: StackingParams) {
  return {
    queryKey: [StackingQueryPrefixes.GetSecondsUntilNextCycle, client],
    queryFn: () => client.getSecondsUntilNextCycle(),
    refetchInterval: 60_000,
    ...defaultQueryOptions,
  } satisfies UseQueryOptions;
}

export function createGetPoxInfoQueryOptions({ client }: StackingParams) {
  return {
    queryKey: [StackingQueryPrefixes.GetPoxInfo, client],
    queryFn: () => client.getPoxInfo(),
    ...defaultQueryOptions,
  } satisfies UseQueryOptions;
}
