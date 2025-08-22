import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { FungibleAssetId, SwapAsset, SwapQuote } from '@leather.io/models';
import { AccountRequest, getSwapService } from '@leather.io/services';
import { hoursInMs, minutesInMs } from '@leather.io/utils';

export function useBaseSwapAssets(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useGetAccountBaseSwapAssetsQuery({ account }));
}

export function useTargetSwapAssets(
  fingerprint: string,
  accountIndex: number,
  baseId: FungibleAssetId
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useGetAccountTargetSwapAssetsQuery({ account }, baseId));
}

export function useSwapQuotes(baseAsset: SwapAsset, targetAsset: SwapAsset, quantity: number) {
  return toFetchState(useGetSwapQuotesQuery(baseAsset, targetAsset, quantity));
}

export function useSwapExecutionData(
  fingerprint: string,
  accountIndex: number,
  quote: SwapQuote,
  slippage: number
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useGetSwapExecutionDataQuery({ account }, quote, slippage));
}

function useGetAccountBaseSwapAssetsQuery(account: AccountRequest) {
  return useQuery({
    queryKey: ['swap-service-get-account-base-swap-assets', account],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSwapService().getAccountBaseSwapAssets(account, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: minutesInMs(15),
    gcTime: hoursInMs(2),
  });
}

function useGetAccountTargetSwapAssetsQuery(account: AccountRequest, baseId: FungibleAssetId) {
  return useQuery({
    queryKey: ['swap-service-get-account-target-swap-assets', account, baseId],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSwapService().getAccountTargetSwapAssets(account, baseId, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: minutesInMs(15),
    gcTime: hoursInMs(2),
  });
}

function useGetSwapQuotesQuery(baseAsset: SwapAsset, targetAsset: SwapAsset, quantity: number) {
  return useQuery({
    queryKey: ['swap-service-get-swap-quotes', baseAsset, targetAsset, quantity],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSwapService().getSwapQuotes(baseAsset, targetAsset, quantity, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 30 * 1000,
    gcTime: 30 * 1000,
  });
}

function useGetSwapExecutionDataQuery(account: AccountRequest, quote: SwapQuote, slippage: number) {
  return useQuery({
    queryKey: ['swap-service-get-swap-execution-data', account, quote, slippage],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSwapService().getSwapExecutionData(account, quote, slippage, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 30 * 1000,
    gcTime: 30 * 1000,
  });
}
