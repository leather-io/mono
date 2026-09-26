import { useCallback } from 'react';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createSbtcSponsorshipQuoteQueryConfig,
  createSubmitSbtcSponsoredTransactionMutationConfig,
} from '@leather.io/queries';
import type { SbtcSponsorshipNetwork, SbtcSponsorshipQuoteResponse } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

function useSbtcSponsorshipNetwork(): SbtcSponsorshipNetwork {
  const network = useCurrentNetwork();
  return network.chain.bitcoin.mode === 'mainnet' ? 'mainnet' : 'testnet';
}

export function isSbtcSponsorshipQuoteExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

interface UseSbtcSponsorshipQuoteArgs {
  enabled: boolean;
}
export function useSbtcSponsorshipQuote({ enabled }: UseSbtcSponsorshipQuoteArgs) {
  const origin = useCurrentStacksAccountAddress();
  const network = useSbtcSponsorshipNetwork();
  const settings = useUserSettings();
  const { data: nextNonce } = useNextNonce(origin);
  const nonce = nextNonce?.nonce;
  const isReady = enabled && !!origin && nonce !== undefined;

  return useQuery({
    ...createSbtcSponsorshipQuoteQueryConfig({ network, origin, nonce: nonce ?? 0 }, settings),
    enabled: isReady,
    placeholderData: keepPreviousData,
  });
}

interface FetchSbtcSponsorshipQuoteResult {
  quote: SbtcSponsorshipQuoteResponse;
  nonce: number;
}
export function useFetchSbtcSponsorshipQuote() {
  const queryClient = useQueryClient();
  const origin = useCurrentStacksAccountAddress();
  const network = useSbtcSponsorshipNetwork();
  const settings = useUserSettings();
  const { data: nextNonce, refetch: refetchNextNonce } = useNextNonce(origin);

  return useCallback(
    async ({
      fresh = false,
    }: { fresh?: boolean } = {}): Promise<FetchSbtcSponsorshipQuoteResult> => {
      const nonce = fresh ? (await refetchNextNonce()).data?.nonce : nextNonce?.nonce;
      if (nonce === undefined) throw new Error('Unable to determine the next account nonce');
      const config = createSbtcSponsorshipQuoteQueryConfig({ network, origin, nonce }, settings);
      if (fresh) await queryClient.invalidateQueries({ queryKey: config.queryKey });
      const quote = await queryClient.fetchQuery(config);
      return { quote, nonce };
    },
    [network, nextNonce?.nonce, origin, queryClient, refetchNextNonce, settings]
  );
}

export function useSubmitSbtcSponsoredTransactionMutation() {
  const mutation = useMutation(createSubmitSbtcSponsoredTransactionMutationConfig());
  return {
    submitSponsoredTransaction: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
