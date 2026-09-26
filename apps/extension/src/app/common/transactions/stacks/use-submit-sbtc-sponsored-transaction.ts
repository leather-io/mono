import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { AuthType, type StacksTransactionWire } from '@stacks/transactions';

import { getSbtcSponsorshipErrorCode } from '@leather.io/services';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useRefreshAllAccountData } from '@app/common/hooks/account/use-refresh-all-account-data';
import type { SbtcSponsorshipRouteState } from '@app/pages/send/send-crypto-asset-form/hooks/use-send-form-navigate';
import {
  isSbtcSponsorshipQuoteExpired,
  useSubmitSbtcSponsoredTransactionMutation,
} from '@app/query/sbtc/sbtc-sponsorship.hooks';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';

import {
  getSbtcSponsorshipErrorMessage,
  sponsoredTransactionBroadcastRefusedMessage,
} from './sbtc-sponsorship.utils';
import {
  type SbtcSponsoredTransfer,
  useBuildSbtcSponsoredTransfer,
} from './use-build-sbtc-sponsored-transfer';

const timeForApiToUpdate = 250;

interface UseSubmitSbtcSponsoredTransactionArgs {
  token: string;
  sponsorship: SbtcSponsorshipRouteState;
  onRequoted(next: SbtcSponsoredTransfer): void;
}
export function useSubmitSbtcSponsoredTransaction({
  token,
  sponsorship,
  onRequoted,
}: UseSubmitSbtcSponsoredTransactionArgs) {
  const signStacksTransaction = useSignStacksTransaction();
  const { submitSponsoredTransaction, isSubmitting } = useSubmitSbtcSponsoredTransactionMutation();
  const buildSponsoredTransfer = useBuildSbtcSponsoredTransfer({
    assetId: sponsorship.assetId,
    decimals: sponsorship.decimals,
  });
  const refreshAccountData = useRefreshAllAccountData();
  const navigate = useNavigate();
  const [isRequoting, setIsRequoting] = useState(false);

  const navigateToError = useCallback(
    (message: string) => navigate(RouteUrls.BroadcastError, { state: { message } }),
    [navigate]
  );

  const requote = useCallback(async () => {
    setIsRequoting(true);
    try {
      onRequoted(
        await buildSponsoredTransfer({
          formValues: sponsorship.formValues,
          feeTier: sponsorship.feeTier,
          fresh: true,
        })
      );
    } catch (error) {
      logger.error('Failed to refresh the sBTC sponsorship quote', error);
      void navigateToError(getSbtcSponsorshipErrorMessage(error));
    } finally {
      setIsRequoting(false);
    }
  }, [
    buildSponsoredTransfer,
    navigateToError,
    onRequoted,
    sponsorship.feeTier,
    sponsorship.formValues,
  ]);

  const submit = useCallback(
    async (unsignedTx: StacksTransactionWire) => {
      if (unsignedTx.auth.authType !== AuthType.Sponsored) {
        logger.error('Refusing to submit a non-sponsored transaction to the sponsor');
        void navigateToError(sponsoredTransactionBroadcastRefusedMessage);
        return;
      }
      if (isSbtcSponsorshipQuoteExpired(sponsorship.expiresAt)) return requote();

      let signedTx: StacksTransactionWire | null | undefined;
      try {
        signedTx = await signStacksTransaction(unsignedTx);
      } catch (error) {
        logger.error('Failed to sign the sponsored transaction', error);
        return;
      }
      if (!signedTx) return;

      try {
        const result = await submitSponsoredTransaction({
          quoteId: sponsorship.quoteId,
          transaction: signedTx.serialize(),
        });
        analytics.track('broadcast_transaction', { symbol: 'stx' });
        void refreshAccountData(timeForApiToUpdate);
        void navigate(
          RouteUrls.SentStxTxSummary.replace(':symbol', token.toLowerCase()).replace(
            ':txid',
            result.txid
          ),
          { state: { tx: result.transaction } }
        );
      } catch (error) {
        const code = getSbtcSponsorshipErrorCode(error);
        if (code === 'quote_expired' || code === 'stale_nonce') return requote();
        logger.error('Failed to submit the sponsored transaction', error);
        void navigateToError(getSbtcSponsorshipErrorMessage(error));
      }
    },
    [
      navigate,
      navigateToError,
      refreshAccountData,
      requote,
      signStacksTransaction,
      sponsorship.expiresAt,
      sponsorship.quoteId,
      submitSponsoredTransaction,
      token,
    ]
  );

  return { submitSponsoredTransaction: submit, isSubmitting: isSubmitting || isRequoting };
}
