import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { StacksTransactionWire } from '@stacks/transactions';
import { AxiosError } from 'axios';

import type { OwnedUtxo } from '@leather.io/models';
import type { SbtcSponsorshipFeeTier } from '@leather.io/services';

import { BitcoinSendFormValues, StacksSendFormValues } from '@shared/models/form.model';
import { RouteUrls } from '@shared/route-urls';

export interface SbtcSponsorshipRouteState {
  quoteId: string;
  feeTier: SbtcSponsorshipFeeTier;
  expiresAt: string;
  feeSats: number;
  feeRecipientPrincipal: string;
  assetId: string;
  decimals: number;
  formValues: StacksSendFormValues;
}

interface ConfirmationRouteState {
  decimals?: number;
  token?: string;
  tx: string;
  sponsorship?: SbtcSponsorshipRouteState;
}

interface ConfirmationRouteStacksSip10Args {
  decimals?: number;
  name?: string;
  tx: StacksTransactionWire;
  sponsorship?: SbtcSponsorshipRouteState;
}

interface ConfirmationRouteBtcArgs {
  tx: string;
  recipient: string;
  fee: number;
  feeRowValue: string;
  time: string;
}

interface ConfirmationRouteBtcProposalArgs {
  psbt: string;
  recipient: string;
  fee: number;
  feeRowValue: string;
  time: string;
  amount: string;
}

export function useSendFormNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(
    () => ({
      toChooseTransactionFee(
        isSendingMax: boolean,
        utxos: OwnedUtxo[],
        values: BitcoinSendFormValues
      ) {
        return navigate(RouteUrls.SendBtcChooseFee, {
          state: {
            isSendingMax,
            utxos,
            values,
          },
        });
      },
      toConfirmAndSignBtcTransaction({
        tx,
        recipient,
        fee,
        feeRowValue,
        time,
      }: ConfirmationRouteBtcArgs) {
        return navigate(RouteUrls.SendBtcConfirmation, {
          state: {
            tx,
            recipient,
            fee,
            feeRowValue,
            time,
          } as ConfirmationRouteState,
        });
      },
      toConfirmBtcProposal(args: ConfirmationRouteBtcProposalArgs) {
        return navigate(RouteUrls.SendBtcConfirmation, {
          state: args,
        });
      },
      toConfirmAndSignStxTransaction(tx: StacksTransactionWire, showFeeChangeWarning: boolean) {
        return navigate(RouteUrls.SendStxConfirmation, {
          state: {
            tx: tx.serialize(),
            showFeeChangeWarning,
          } as ConfirmationRouteState,
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
          } as ConfirmationRouteState,
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
