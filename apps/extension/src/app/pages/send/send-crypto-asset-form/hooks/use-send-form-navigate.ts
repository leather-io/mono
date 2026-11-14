import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { type StacksTransactionWire } from '@stacks/transactions';
import { AxiosError } from 'axios';
import { z } from 'zod';

import type { StacksSendFormValues } from '@shared/models/form.model';
import { RouteUrls } from '@shared/route-urls';

const stacksSendFormValuesSchema = z.object({
  amount: z.union([z.number(), z.string()]),
  assetId: z.string().optional(),
  fee: z.union([z.number(), z.string()]),
  feeCurrency: z.string(),
  feeType: z.string(),
  memo: z.string(),
  nonce: z.union([z.number(), z.string()]).optional(),
  recipient: z.string(),
  recipientBnsName: z.string(),
  symbol: z.string().optional(),
}) satisfies z.ZodType<StacksSendFormValues>;

const sbtcSponsorshipRouteStateSchema = z.object({
  quoteId: z.string(),
  stxFeeMicro: z.number(),
  expiresAt: z.string(),
  assetId: z.string(),
  formValues: stacksSendFormValuesSchema,
});

export type SbtcSponsorshipRouteState = z.infer<typeof sbtcSponsorshipRouteStateSchema>;

interface ConfirmationRouteStacksSip10Args {
  decimals?: number;
  name?: string;
  tx: StacksTransactionWire;
  sponsorship?: SbtcSponsorshipRouteState;
}

const ownedUtxoSchema = z.object({
  txid: z.string(),
  vout: z.number(),
  height: z.number().optional(),
  value: z.number(),
  address: z.string(),
  path: z.string(),
  keyOrigin: z.string(),
});

export const btcChooseFeeRouteStateSchema = z.object({
  isSendingMax: z.boolean(),
  utxos: z.array(ownedUtxoSchema),
  values: z.object({ amount: z.union([z.number(), z.string()]), recipient: z.string() }),
});

type BtcChooseFeeRouteState = z.infer<typeof btcChooseFeeRouteStateSchema>;

const btcBroadcastConfirmationRouteStateSchema = z.object({
  mode: z.literal('broadcast'),
  tx: z.string(),
  recipient: z.string(),
  fee: z.number(),
  feeRowValue: z.string(),
  time: z.string(),
});

const btcProposalConfirmationRouteStateSchema = z.object({
  mode: z.literal('propose'),
  psbt: z.string(),
  recipient: z.string(),
  fee: z.number(),
  feeRowValue: z.string(),
  time: z.string(),
  amount: z.string(),
});

export const btcConfirmationRouteStateSchema = z.discriminatedUnion('mode', [
  btcBroadcastConfirmationRouteStateSchema,
  btcProposalConfirmationRouteStateSchema,
]);

export type BtcBroadcastConfirmationRouteState = z.infer<
  typeof btcBroadcastConfirmationRouteStateSchema
>;

export type BtcProposalConfirmationRouteState = z.infer<
  typeof btcProposalConfirmationRouteStateSchema
>;

export const stacksConfirmationRouteStateSchema = z.object({
  tx: z.string(),
  decimals: z.number().optional(),
  token: z.string().optional(),
  showFeeChangeWarning: z.boolean().optional(),
  sponsorship: sbtcSponsorshipRouteStateSchema.optional(),
  showRequoteCallout: z.boolean().optional(),
});

type StacksConfirmationRouteState = z.infer<typeof stacksConfirmationRouteStateSchema>;

export function useSendFormNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(
    () => ({
      toChooseTransactionFee(
        isSendingMax: boolean,
        utxos: BtcChooseFeeRouteState['utxos'],
        values: BtcChooseFeeRouteState['values']
      ) {
        return navigate(RouteUrls.SendBtcChooseFee, {
          state: {
            isSendingMax,
            utxos,
            values,
          } satisfies BtcChooseFeeRouteState,
        });
      },
      toConfirmAndSignBtcTransaction(args: Omit<BtcBroadcastConfirmationRouteState, 'mode'>) {
        return navigate(RouteUrls.SendBtcConfirmation, {
          state: { ...args, mode: 'broadcast' } satisfies BtcBroadcastConfirmationRouteState,
        });
      },
      toConfirmBtcProposal(args: Omit<BtcProposalConfirmationRouteState, 'mode'>) {
        return navigate(RouteUrls.SendBtcConfirmation, {
          state: { ...args, mode: 'propose' } satisfies BtcProposalConfirmationRouteState,
        });
      },
      toConfirmAndSignStxTransaction(tx: StacksTransactionWire, showFeeChangeWarning: boolean) {
        return navigate(RouteUrls.SendStxConfirmation, {
          state: {
            tx: tx.serialize(),
            showFeeChangeWarning,
          } satisfies StacksConfirmationRouteState,
        });
      },
      toConfirmAndSignStacksSip10Transaction({
        decimals,
        name,
        tx,
        sponsorship,
      }: ConfirmationRouteStacksSip10Args) {
        return navigate(`${location.pathname}/confirm`, {
          state: {
            decimals,
            token: name,
            tx: tx.serialize(),
            sponsorship,
          } satisfies StacksConfirmationRouteState,
        });
      },
      toErrorPage(error: unknown, options?: { proposeMode?: boolean }) {
        // without this processing, navigate does not work
        const processedError = error instanceof AxiosError ? new Error(error.message) : error;

        return navigate('../error', {
          relative: 'path',
          replace: true,
          state: { error: processedError, proposeMode: options?.proposeMode },
        });
      },
    }),
    [navigate, location]
  );
}
