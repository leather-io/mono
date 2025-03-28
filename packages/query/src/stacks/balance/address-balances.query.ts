import type { QueryFunctionContext } from '@tanstack/react-query';

import { oneWeekInMs } from '@leather.io/utils';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

const staleTime = 1 * 60 * 1000;

const queryOptions = {
  staleTime,
  gcTime: oneWeekInMs,
  refetchInterval: staleTime,
} as const;

interface CreateGetStacksAddressBalanceQueryOptionsArgs {
  address: string;
  client: StacksClient;
  network: string;
}

export function createGetStxAddressBalanceQueryOptions({
  address,
  client,
  network,
}: CreateGetStacksAddressBalanceQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [StacksQueryPrefixes.GetStxAddressBalance, address, network],
    queryFn: ({ signal }: QueryFunctionContext) => client.getStxAddressBalance(address, signal),
    ...queryOptions,
  } as const;
}

export function createGetSip10AddressBalancesQueryOptions({
  address,
  client,
  network,
}: CreateGetStacksAddressBalanceQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [StacksQueryPrefixes.GetSip10AddressBalances, address, network],
    queryFn: ({ signal }: QueryFunctionContext) => client.getSip10AddressBalances(address, signal),
    ...queryOptions,
  } as const;
}
