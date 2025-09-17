import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { isDefined } from 'remeda';

import {
  AccountId,
  CryptoAssetId,
  FungibleAssetId,
  SwapAsset,
  SwapExecutionData,
  SwapQuote,
} from '@leather.io/models';
import { AccountSwapAsset, SwapService, getSwapService } from '@leather.io/services';
import { assertExistence } from '@leather.io/utils';

type CustomQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;

function useCurrentAccount(): AccountId {
  const { currentAccount } = useSettings();
  assertExistence(
    currentAccount,
    "Attempted to use 'currentAccount' before one was set. " +
      'Ensure this hook is only called after an account has been created and selected.'
  );
  return currentAccount;
}

function useAccountRequest() {
  const account = useCurrentAccount();
  const accountAddresses = useAccountAddresses(account.fingerprint, account.accountIndex);
  return { account: accountAddresses };
}

export function createAccountBaseSwapAssetsQuery(service: SwapService) {
  return function useAccountBaseSwapAssetsQuery(
    params: {
      queryOptions?: Omit<UseQueryOptions<AccountSwapAsset[]>, 'queryKey' | 'queryFn'>;
    } = {}
  ) {
    const request = useAccountRequest();
    const { queryOptions } = params;
    return useQuery({
      queryKey: ['account-base-swap-assets', { request }],
      queryFn: ({ signal }) => service.getAccountBaseSwapAssets(request, signal),
      ...queryOptions,
    });
  };
}

export function createAccountTargetSwapAssetsQuery(service: SwapService) {
  return function useAccountTargetSwapAssetsQuery(params: {
    baseId?: CryptoAssetId;
    queryOptions?: CustomQueryOptions<AccountSwapAsset[]>;
  }) {
    const request = useAccountRequest();
    const { baseId, queryOptions } = params;
    return useQuery({
      queryKey: ['account-target-swap-assets', { baseId, request }],
      queryFn: ({ signal }) => {
        if (!baseId) return [];
        return service.getAccountTargetSwapAssets(request, baseId, signal);
      },
      enabled: isDefined(baseId),
      ...queryOptions,
    });
  };
}

export function createBaseSwapAssetsQuery(service: SwapService) {
  return function useBaseSwapAssetsQuery(params?: {
    queryOptions?: CustomQueryOptions<SwapAsset[]>;
  }) {
    const { queryOptions } = params ?? {};
    return useQuery({
      queryKey: ['base-swap-assets'],
      queryFn: ({ signal }) => service.getBaseSwapAssets(signal),
      ...queryOptions,
    });
  };
}

export function createTargetSwapAssetsQuery(service: SwapService) {
  return function useTargetSwapAssetsQuery(params: {
    baseAssetId: FungibleAssetId;
    queryOptions?: CustomQueryOptions<SwapAsset[]>;
  }) {
    const { baseAssetId, queryOptions } = params;
    return useQuery({
      queryKey: ['target-swap-assets', { baseAssetId }],
      queryFn: ({ signal }) => service.getTargetSwapAssets(baseAssetId, signal),
      ...queryOptions,
    });
  };
}

export function createSwapQuotesQuery(service: SwapService) {
  return function useSwapQuotesQuery(params: {
    baseAsset: SwapAsset;
    targetAsset: SwapAsset;
    baseAmount: number;
    queryOptions?: CustomQueryOptions<SwapQuote[]>;
  }) {
    const { baseAsset, targetAsset, baseAmount, queryOptions } = params;
    return useQuery({
      queryKey: ['swap-quotes', { baseAsset, targetAsset, baseAmount }],
      queryFn: ({ signal }) => service.getSwapQuotes(baseAsset, targetAsset, baseAmount, signal),
      ...queryOptions,
    });
  };
}

export function createSwapExecutionDataQuery(service: SwapService) {
  return function useSwapExecutionDataQuery(params: {
    quote: SwapQuote;
    slippage: number;
    queryOptions?: CustomQueryOptions<SwapExecutionData>;
  }) {
    const request = useAccountRequest();
    const { quote, slippage, queryOptions } = params;
    return useQuery({
      queryKey: ['swap-execution-data', { request, quote, slippage }],
      queryFn: ({ signal }) => service.getSwapExecutionData(request, quote, slippage, signal),
      ...queryOptions,
    });
  };
}

const swapService = getSwapService();

export const useAccountBaseSwapAssetsQuery = createAccountBaseSwapAssetsQuery(swapService);
export const useAccountTargetSwapAssetsQuery = createAccountTargetSwapAssetsQuery(swapService);
export const useBaseSwapAssetsQuery = createBaseSwapAssetsQuery(swapService);
export const useTargetSwapAssetsQuery = createTargetSwapAssetsQuery(swapService);
export const useSwapQuotesQuery = createSwapQuotesQuery(swapService);
export const useSwapExecutionDataQuery = createSwapExecutionDataQuery(swapService);
