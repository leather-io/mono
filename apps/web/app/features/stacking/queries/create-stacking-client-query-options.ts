import { type StackingClient } from '@stacks/stacking';
import type { UseQueryOptions } from '@tanstack/react-query';

const StackingQueryPrefixes = {
  GetStatus: 'get-status',
  GetCoreInfo: 'get-core-info',
  GetSecondsUntilNextCycle: 'get-seconds-until-next-cycle',
  GetPoxInfo: 'get-pox-info',
  GetAccountExtendedBalances: 'get-account-extended-balances',
} as const;

const defaultQueryOptions = {
  refetchOnMount: true,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
} as const;

interface StackingParams {
  client: StackingClient;
}

export function createGetStatusQueryOptions({ client }: StackingParams) {
  return {
    queryKey: [StackingQueryPrefixes.GetStatus, client],
    queryFn: () => client.getStatus(),
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

export function createGetAccountExtendedBalancesQueryOptions({ client }: StackingParams) {
  return {
    queryKey: [StackingQueryPrefixes.GetAccountExtendedBalances, client],
    queryFn: () => client.getAccountExtendedBalances(),
    ...defaultQueryOptions,
  } satisfies UseQueryOptions;
}
