import { useCallback } from 'react';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createSbtcSponsorshipQuoteQueryConfig,
  createSubmitSbtcSponsoredTransactionMutationConfig,
} from '@leather.io/queries';
import type { SbtcSponsorshipQuoteResponse } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

export function isSbtcSponsorshipQuoteExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

interface UseSbtcSponsorshipQuoteArgs {
  enabled: boolean;
}
export function useSbtcSponsorshipQuote({ enabled }: UseSbtcSponsorshipQuoteArgs) {
  const settings = useUserSettings();

  return useQuery({
    ...createSbtcSponsorshipQuoteQueryConfig(settings),
    enabled,
    placeholderData: keepPreviousData,
  });
}

interface FetchSbtcSponsorshipQuoteResult {
  quote: SbtcSponsorshipQuoteResponse;
  nonce: number;
}
export function useFetchSbtcSponsorshipQuote() {
  const queryClient = useQueryClient();
  const address = useCurrentStacksAccountAddress();
  const settings = useUserSettings();
  const { data: nextNonce, refetch: refetchNextNonce } = useNextNonce(address);

  return useCallback(
    async ({
      fresh = false,
    }: { fresh?: boolean } = {}): Promise<FetchSbtcSponsorshipQuoteResult> => {
      const cachedNonce = nextNonce?.nonce;
      const nonce =
        fresh || cachedNonce === undefined ? (await refetchNextNonce()).data?.nonce : cachedNonce;
      if (nonce === undefined) throw new Error('Unable to determine the next account nonce');
      const config = createSbtcSponsorshipQuoteQueryConfig(settings);
      if (fresh) await queryClient.invalidateQueries({ queryKey: config.queryKey });
      const quote = await queryClient.fetchQuery(config);
      return { quote, nonce };
    },
    [nextNonce?.nonce, queryClient, refetchNextNonce, settings]
  );
}

export function useSubmitSbtcSponsoredTransactionMutation() {
  const mutation = useMutation(createSubmitSbtcSponsoredTransactionMutationConfig());
  return {
    submitSponsoredTransaction: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
