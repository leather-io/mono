import type { UseMutationOptions } from '@tanstack/react-query';

import {
  type SbtcSponsorshipSubmitRequest,
  type SbtcSponsorshipSubmitResponse,
  getLeatherSponsorshipApiClient,
} from '@leather.io/services';

export function createSubmitSbtcSponsoredTransactionMutationConfig() {
  return {
    mutationKey: ['sbtc-sponsorship-submit-transaction'],
    mutationFn(body: SbtcSponsorshipSubmitRequest) {
      return getLeatherSponsorshipApiClient().submitTransaction(body);
    },
  } satisfies UseMutationOptions<
    SbtcSponsorshipSubmitResponse,
    Error,
    SbtcSponsorshipSubmitRequest
  >;
}
