import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { AuthType, type StacksTransactionWire } from '@stacks/transactions';

import {
  type SbtcSponsorshipErrorCode,
  getLeatherApiClient,
  getSbtcSponsorshipErrorCode,
} from '@leather.io/services';
import type { SbtcSponsoredTransferDetails } from '@leather.io/stacks';
import { delay } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useRefreshAllAccountData } from '@app/common/hooks/account/use-refresh-all-account-data';
import type { SbtcSponsorshipRouteState } from '@app/pages/send/send-crypto-asset-form/hooks/use-send-form-navigate';
import { isSbtcSponsorshipQuoteExpired } from '@app/query/sbtc/sbtc-sponsorship.hooks';
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
const fundingPendingRetryDelayMs = 3000;
const fundingPendingMaxRetries = 5;
const sponsorRejectionCodes: SbtcSponsorshipErrorCode[] = [
  'stale_nonce',
  'funding_pending',
  'not_eligible',
];

async function retryWhileFundingPending<T>(submit: () => Promise<T>, retriesLeft: number) {
  try {
    return await submit();
  } catch (error) {
    if (getSbtcSponsorshipErrorCode(error) !== 'funding_pending' || retriesLeft === 0) throw error;
    await delay(fundingPendingRetryDelayMs);
    return retryWhileFundingPending(submit, retriesLeft - 1);
  }
}

interface UseSubmitSbtcSponsoredTransactionArgs {
  token: string;
  details: SbtcSponsoredTransferDetails;
  sponsorship: SbtcSponsorshipRouteState;
  onRequoted(next: SbtcSponsoredTransfer): void;
}
export function useSubmitSbtcSponsoredTransaction({
  token,
  details,
  sponsorship,
  onRequoted,
}: UseSubmitSbtcSponsoredTransactionArgs) {
  const signStacksTransaction = useSignStacksTransaction();
  const buildSponsoredTransfer = useBuildSbtcSponsoredTransfer(details.contractId);
  const refreshAccountData = useRefreshAllAccountData();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigateToError = useCallback(
    (message: string) => navigate(RouteUrls.BroadcastError, { state: { message } }),
    [navigate]
  );

  const requote = useCallback(async () => {
    try {
      onRequoted(
        await buildSponsoredTransfer({
          recipient: details.recipient,
          amount: details.amount,
          memo: details.memo,
          stxFeeMicro: sponsorship.stxFeeMicro,
          fresh: true,
        })
      );
    } catch (error) {
      logger.error('Failed to refresh the sBTC sponsorship quote', error);
      void navigateToError(getSbtcSponsorshipErrorMessage(error));
    }
  }, [
    buildSponsoredTransfer,
    details.amount,
    details.memo,
    details.recipient,
    navigateToError,
    onRequoted,
    sponsorship.stxFeeMicro,
  ]);

  const submitUnguarded = useCallback(
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
        const request = { quoteId: sponsorship.quoteId, transaction: signedTx.serialize() };
        const result = await retryWhileFundingPending(
          () => getLeatherApiClient().submitSbtcSponsoredTransaction(request),
          fundingPendingMaxRetries
        );
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
        if (code === 'quote_expired') return requote();
        logger.error('Failed to submit the sponsored transaction', error);
        if (code && sponsorRejectionCodes.includes(code)) {
          void navigateToError(getSbtcSponsorshipErrorMessage(error));
          return;
        }
        void refreshAccountData(timeForApiToUpdate);
        void navigate(RouteUrls.BroadcastError, { state: { outcomeUnknown: true } });
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
      token,
    ]
  );

  const submit = useCallback(
    async (unsignedTx: StacksTransactionWire) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      try {
        await submitUnguarded(unsignedTx);
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [submitUnguarded]
  );

  return { submitSponsoredTransaction: submit, isSubmitting };
}
