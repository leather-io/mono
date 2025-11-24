import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import {
  AccountRequest,
  Sip10AggregateBalance,
  Sip10Balance,
  Sip10AddressBalance,
  getSip10BalancesService,
} from '@leather.io/services';

import { balanceQueryOptions } from './query-options';
import { BalanceQueryHookOptions } from './types';

export function useGetSip10AccountBalanceQuery(
  request: AccountRequest,
  options: BalanceQueryHookOptions<Sip10AddressBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: ['sip10-balances-service-get-sip10-account-balance', request, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AccountBalance(request, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetSip10AggregateBalanceQuery(
  requests: AccountRequest[],
  options: BalanceQueryHookOptions<Sip10AggregateBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-aggregate-balance',
      requests,
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AggregateBalance(requests, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetSip10AggregateBalanceByAssetIdQuery(
  requests: AccountRequest[],
  assetId: string,
  options: BalanceQueryHookOptions<Sip10Balance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-aggregate-balance-by-asset-id',
      assetId,
      requests,
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AggregateBalanceByAssetId(requests, assetId, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetSip10BalanceByAssetIdQuery(
  request: AccountRequest,
  assetId: string,
  options: BalanceQueryHookOptions<Sip10Balance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-balance-by-asset-id',
      assetId,
      request,
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10BalanceByAssetId(request, assetId, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetSip10BalanceByContractIdQuery(
  request: AccountRequest,
  contractId: string,
  options: BalanceQueryHookOptions<Sip10Balance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-balance-by-contract-id',
      contractId,
      request,
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10BalanceByContractId(request, contractId, signal),
    ...balanceQueryOptions,
    ...queryOptions,
  });
}

export function useGetSip10AddressBalanceQuery(
  address: string,
  includeHiddenAssets: boolean,
  options: BalanceQueryHookOptions<Sip10AddressBalance> = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-address-balance',
      address,
      includeHiddenAssets,
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AddressBalance(address, includeHiddenAssets, signal),
    enabled: !!address,
    ...balanceQueryOptions,
    ...queryOptions,
  });
}
