import { useCallback } from 'react';

import type { StacksTransactionWire } from '@stacks/transactions';

import type { SbtcSponsorshipFeeTier } from '@leather.io/services';

import type { StacksSendFormValues } from '@shared/models/form.model';

import type { SbtcSponsorshipRouteState } from '@app/pages/send/send-crypto-asset-form/hooks/use-send-form-navigate';
import { useFetchSbtcSponsorshipQuote } from '@app/query/sbtc/sbtc-sponsorship.hooks';
import { useGenerateSbtcSponsoredTransferUnsignedTx } from '@app/store/transactions/token-transfer.hooks';

export interface SbtcSponsoredTransfer {
  tx: StacksTransactionWire;
  sponsorship: SbtcSponsorshipRouteState;
}

interface UseBuildSbtcSponsoredTransferArgs {
  assetId: string;
  decimals: number;
}

interface BuildSbtcSponsoredTransferArgs {
  formValues: StacksSendFormValues;
  feeTier: SbtcSponsorshipFeeTier;
  fresh?: boolean;
}

export function useBuildSbtcSponsoredTransfer({
  assetId,
  decimals,
}: UseBuildSbtcSponsoredTransferArgs) {
  const fetchSbtcSponsorshipQuote = useFetchSbtcSponsorshipQuote();
  const generateSponsoredTx = useGenerateSbtcSponsoredTransferUnsignedTx({ assetId, decimals });

  return useCallback(
    async ({
      formValues,
      feeTier,
      fresh = false,
    }: BuildSbtcSponsoredTransferArgs): Promise<SbtcSponsoredTransfer> => {
      const { quote, nonce } = await fetchSbtcSponsorshipQuote({ fresh });
      const tier = quote.tiers[feeTier];
      const values = fresh ? { ...formValues, nonce } : formValues;
      const tx = await generateSponsoredTx(values, {
        feeSats: tier.feeSats,
        feeRecipientPrincipal: quote.feeRecipientPrincipal,
      });
      if (!tx) throw new Error('Unable to build the sponsored transaction');
      return {
        tx,
        sponsorship: {
          quoteId: tier.quoteId,
          feeTier,
          expiresAt: quote.expiresAt,
          feeSats: tier.feeSats,
          feeRecipientPrincipal: quote.feeRecipientPrincipal,
          assetId,
          decimals,
          formValues: values,
        },
      };
    },
    [assetId, decimals, fetchSbtcSponsorshipQuote, generateSponsoredTx]
  );
}
