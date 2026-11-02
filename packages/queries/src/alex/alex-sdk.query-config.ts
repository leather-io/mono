import type { UseQueryOptions } from '@tanstack/react-query';

import {
  type AlexSdkLatestPrices,
  type AlexSdkTokenInfo,
  type UserSettings,
  getAlexSdkClient,
} from '@leather.io/services';
import { minutesInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

const alexSdkQueryOptions = {
  refetchOnMount: true,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retryDelay: minutesInMs(1),
  staleTime: minutesInMs(10),
} satisfies Partial<UseQueryOptions>;

export function createAlexSwappableCurrenciesQueryKey(settings: UserSettings) {
  return createServiceQueryKey('alex-sdk-client--fetch-swappable-currency', [], settings);
}

export function createAlexSwappableCurrenciesQueryConfig(settings: UserSettings) {
  return {
    queryKey: createAlexSwappableCurrenciesQueryKey(settings),
    queryFn: (): Promise<AlexSdkTokenInfo[]> => getAlexSdkClient().fetchSwappableCurrency(),
    ...alexSdkQueryOptions,
  };
}

export function createAlexLatestPricesQueryKey(settings: UserSettings) {
  return createServiceQueryKey('alex-sdk-client--get-latest-prices', [], settings);
}

export function createAlexLatestPricesQueryConfig(settings: UserSettings) {
  return {
    queryKey: createAlexLatestPricesQueryKey(settings),
    queryFn: (): Promise<AlexSdkLatestPrices> => getAlexSdkClient().getLatestPrices(),
    ...alexSdkQueryOptions,
  };
}
