import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type SbtcSponsorshipQuoteRequest,
  type SbtcSponsorshipQuoteResponse,
  type UserSettings,
  getLeatherSponsorshipApiClient,
} from '@leather.io/services';
import { minutesInMs, secondsInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export interface SbtcSponsorshipQuoteQueryArgs extends SbtcSponsorshipQuoteRequest {
  nonce: number;
}

export function createSbtcSponsorshipQuoteQueryKey(
  { network, origin, nonce }: SbtcSponsorshipQuoteQueryArgs,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'leather-sponsorship-api--get-quote',
    [network, origin, nonce],
    settings
  );
}

export function createSbtcSponsorshipQuoteQueryConfig(
  args: SbtcSponsorshipQuoteQueryArgs,
  settings: UserSettings
) {
  const { network, origin } = args;
  return {
    queryKey: createSbtcSponsorshipQuoteQueryKey(args, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getLeatherSponsorshipApiClient().fetchQuote({ network, origin }, { signal }),
    staleTime: secondsInMs(15),
    gcTime: minutesInMs(1),
    meta: { persist: false },
    retry: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  } satisfies UseQueryOptions<SbtcSponsorshipQuoteResponse, Error>;
}
