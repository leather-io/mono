import type { QueryFunctionContext } from '@tanstack/react-query';

import { type UserSettings, getLeatherApiClient } from '@leather.io/services';
import { minutesInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createBitcoinFeeRatesQueryKey(settings: UserSettings) {
  return createServiceQueryKey('leather-api--bitcoin-fee-rates', [], settings);
}

export function createBitcoinFeeRatesQueryConfig(settings: UserSettings) {
  return {
    queryKey: createBitcoinFeeRatesQueryKey(settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getLeatherApiClient().fetchBitcoinFeeRates({ signal }),
    refetchInterval: minutesInMs(2),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  };
}
