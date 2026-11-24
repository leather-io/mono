import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type SbtcSponsorshipQuoteResponse,
  type UserSettings,
  getLeatherApiClient,
} from '@leather.io/services';
import { minutesInMs, secondsInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createSbtcSponsorshipQuoteQueryConfig(settings: UserSettings) {
  return {
    queryKey: createServiceQueryKey('leather-sponsorship-api--get-quote', [], settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getLeatherApiClient().fetchSbtcSponsorshipQuote({ signal }),
    staleTime: secondsInMs(15),
    gcTime: minutesInMs(1),
    meta: { persist: false },
    retry: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  } satisfies UseQueryOptions<SbtcSponsorshipQuoteResponse>;
}
