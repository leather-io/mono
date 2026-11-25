import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-async-hook';
import { useNavigate } from 'react-router';

import type { Money } from '@leather.io/models';
import {
  RpcErrorCode,
  type RpcMethodNames,
  createRpcErrorResponse,
  createRpcSuccessResponse,
} from '@leather.io/rpc';
import {
  type SbtcSponsorshipQuoteResponse,
  getErrorDetail,
  getHiroStacksApiClient,
  getLeatherApiClient,
  getSbtcSponsorshipErrorCode,
  getSbtcSponsorshipQuoteServiceId,
  getSbtcSponsorshipUnconfirmedBroadcast,
} from '@leather.io/services';
import {
  type StacksUnsignedContractCallOptions,
  generateStacksUnsignedTransaction,
} from '@leather.io/stacks';
import { createMoney, delay, isDefined, minutesInMs, secondsInMs } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import {
  generateSbtcSponsoredCallTransactions,
  getSbtcSponsoredCallBudgetSats,
  getSbtcSponsorshipContractId,
  getSbtcSponsorshipErrorMessage,
  getSbtcSponsorshipFeeSats,
  getSbtcSponsorshipRefusalAction,
  isSbtcSponsorableContractCall,
} from '@app/common/transactions/stacks/sbtc-sponsorship.utils';
import { type Fee, useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';
import { useNonceEditorContext } from '@app/features/nonce-editor/nonce-editor.context';
import { useToast } from '@app/features/toasts/use-toast';
import {
  isSbtcSponsorshipQuoteExpired,
  useSbtcSponsorshipQuote,
} from '@app/query/sbtc/sbtc-sponsorship.hooks';
import { useSip10AddressTransferableTokenBalances } from '@app/query/stacks/sip10/sip10-balance.hooks';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';

import { useStacksRpcTransactionRequestContext } from '../stacks-rpc-transaction-request.context';

export const sbtcSponsoredCallPaymentTimeoutMinutes = 10;
const paymentTimeoutMs = minutesInMs(sbtcSponsoredCallPaymentTimeoutMinutes);
const paymentSubmitWindowMs = minutesInMs(1);
const callSubmitWindowMs = minutesInMs(3);
const paymentPollIntervalMs = secondsInMs(5);
const submitRetryDelayMs = secondsInMs(3);
const quoteRefetchIntervalMs = minutesInMs(1);
const closeWindowDelayMs = secondsInMs(1);

export type SbtcSponsoredCallStep = 'paying' | 'confirming' | 'calling' | 'sent';

export type SbtcSponsoredCallFailure =
  | 'payment-unknown'
  | 'payment-failed'
  | 'payment-unconfirmed'
  | 'call-not-sent'
  | 'call-unknown';

export interface SbtcSponsoredCallProgress {
  step: SbtcSponsoredCallStep;
  failure?: SbtcSponsoredCallFailure;
  failureDetail?: string;
}

export interface SbtcSponsoredCallOffer {
  contractId: string;
  quote: SbtcSponsorshipQuoteResponse;
  paymentNonce: number;
  total: Money;
  getTotal(fee: Fee): Money;
}

async function waitForPayment(
  txid: string,
  deadline: number
): Promise<'confirmed' | 'failed' | 'unconfirmed'> {
  const tx = await getHiroStacksApiClient()
    .getTransactionById(txid, { skipCache: true })
    .catch(() => null);
  if (tx?.status === 'success') return 'confirmed';
  if (tx && tx.status !== 'pending') return 'failed';
  if (Date.now() >= deadline) return 'unconfirmed';
  await delay(paymentPollIntervalMs);
  return waitForPayment(txid, deadline);
}

type SponsorshipQuoteRef = Pick<SbtcSponsorshipQuoteResponse, 'quoteId' | 'expiresAt'>;

function fetchQuoteFromSameService({ quoteId }: SponsorshipQuoteRef) {
  return getLeatherApiClient().fetchSbtcSponsorshipQuote({
    service: getSbtcSponsorshipQuoteServiceId(quoteId),
  });
}

class SponsoredBroadcastOutcomeUnknownError extends Error {}

interface SponsoredBroadcast {
  txid: string;
  transaction: string;
}

interface SubmitToSponsorArgs {
  quote: SponsorshipQuoteRef;
  deadline: number;
  awaitsPayment: boolean;
  submit(quoteId: string): Promise<SponsoredBroadcast>;
}
interface SubmitToSponsorAttempt {
  requote?: boolean;
  unconfirmedBroadcast?: SponsoredBroadcast;
  mayBeSent?: boolean;
}
async function submitToSponsor(
  { quote, deadline, awaitsPayment, submit }: SubmitToSponsorArgs,
  { requote, unconfirmedBroadcast, mayBeSent }: SubmitToSponsorAttempt = {}
): Promise<{ quote: SponsorshipQuoteRef; broadcast: SponsoredBroadcast }> {
  let activeQuote = quote;
  try {
    if (requote || isSbtcSponsorshipQuoteExpired(quote.expiresAt))
      activeQuote = await fetchQuoteFromSameService(quote);
    return { quote: activeQuote, broadcast: await submit(activeQuote.quoteId) };
  } catch (error) {
    const code = getSbtcSponsorshipErrorCode(error);
    const broadcast = getSbtcSponsorshipUnconfirmedBroadcast(error) ?? unconfirmedBroadcast;
    if (broadcast && code === 'stale_nonce') return { quote: activeQuote, broadcast };

    const action = getSbtcSponsorshipRefusalAction(error, { awaitsPayment });
    const hasNoDefiniteAnswer = !code || code === 'upstream_unavailable';
    const outcomeUnknown =
      mayBeSent || isDefined(broadcast) || (hasNoDefiniteAnswer && action === 'retry');
    if (action === 'stop' || Date.now() >= deadline)
      throw outcomeUnknown ? new SponsoredBroadcastOutcomeUnknownError() : error;

    await delay(submitRetryDelayMs);
    return submitToSponsor(
      { quote: activeQuote, deadline, awaitsPayment, submit },
      { requote: action === 'requote', unconfirmedBroadcast: broadcast, mayBeSent: outcomeUnknown }
    );
  }
}

interface UseSbtcSponsoredCallArgs {
  method: RpcMethodNames;
  callOptions: StacksUnsignedContractCallOptions;
  isEligibleRequest: boolean;
}
export function useSbtcSponsoredCall({
  method,
  callOptions,
  isEligibleRequest,
}: UseSbtcSponsoredCallArgs) {
  const { address, network, publicKey, onSetTransactionStatus, tabId, requestId, frameId } =
    useStacksRpcTransactionRequestContext();
  const { availableBalance, fees, selectedFee } = useFeeEditorContext();
  const { nonce } = useNonceEditorContext();
  const signStacksTransaction = useSignStacksTransaction();
  const navigate = useNavigate();
  const toast = useToast();
  const [progress, setProgress] = useState<SbtcSponsoredCallProgress | null>(null);

  const contractId = getSbtcSponsorshipContractId(network.chainId);
  const cannotCoverStxFee = availableBalance.amount.isLessThan(fees.slow.txFee.amount);
  const isEnabled = isEligibleRequest && cannotCoverStxFee && isDefined(contractId);

  const quoteQuery = useSbtcSponsorshipQuote({
    enabled: isEnabled && !progress,
    refetchInterval: quoteRefetchIntervalMs,
  });
  const sbtcBalances = useSip10AddressTransferableTokenBalances(address);
  const sponsorableCall = useAsync(
    async () =>
      isEnabled &&
      isSbtcSponsorableContractCall(
        await generateStacksUnsignedTransaction({ ...callOptions, sponsored: true })
      ),
    [callOptions, isEnabled]
  );

  const quote = quoteQuery.data;
  const sbtc = sbtcBalances.sip10s.find(token => token.asset.contractId === contractId);

  const offer = useMemo<SbtcSponsoredCallOffer | undefined>(() => {
    if (!contractId || !quote || !sbtc || !sponsorableCall.result) return undefined;
    const { symbol, decimals } = sbtc.asset;
    const rate = quote;
    function getTotal(fee: Fee) {
      return createMoney(
        getSbtcSponsoredCallBudgetSats(fee.txFee.amount, rate) +
          getSbtcSponsorshipFeeSats(fee.txFee.amount, rate),
        symbol,
        decimals
      );
    }
    const total = getTotal(selectedFee);
    if (sbtc.crypto.availableBalance.amount.isLessThan(total.amount)) return undefined;
    return { contractId, quote, paymentNonce: Number(nonce), total, getTotal };
  }, [contractId, nonce, quote, sbtc, selectedFee, sponsorableCall.result]);

  const isLoading =
    isEnabled && (quoteQuery.isPending || sbtcBalances.isLoading || sponsorableCall.loading);

  const fail = useCallback(
    (step: SbtcSponsoredCallStep, failure: SbtcSponsoredCallFailure, error?: unknown) => {
      if (error) logger.error('Sponsored contract call failed', { failure, error });
      onSetTransactionStatus('idle');
      setProgress({ step, failure, failureDetail: error ? getErrorDetail(error) : undefined });
      void sendMessageToOriginatingFrame(
        { frameId, tabId },
        createRpcErrorResponse(method, {
          id: requestId,
          error: {
            code: RpcErrorCode.INTERNAL_ERROR,
            message: 'The sponsored contract call did not complete',
          },
        })
      );
    },
    [frameId, method, onSetTransactionStatus, requestId, tabId]
  );

  const approve = useCallback(async () => {
    if (!offer) return;
    if (isSbtcSponsorshipQuoteExpired(offer.quote.expiresAt)) {
      onSetTransactionStatus('idle');
      await quoteQuery.refetch();
      toast.info('The sBTC fee was refreshed. Review it and approve again.');
      return;
    }

    const { paymentTx, callTx } = await generateSbtcSponsoredCallTransactions({
      callOptions,
      contractId: offer.contractId,
      sender: address,
      publicKey,
      network,
      quote: offer.quote,
      stxFeeMicro: selectedFee.txFee.amount,
      nonce: offer.paymentNonce,
    });
    const signedPayment = await signStacksTransaction(paymentTx);
    const signedCall = signedPayment ? await signStacksTransaction(callTx) : null;
    if (!signedPayment || !signedCall) {
      onSetTransactionStatus('idle');
      return;
    }

    setProgress({ step: 'paying' });
    const client = getLeatherApiClient();
    let payment: Awaited<ReturnType<typeof submitToSponsor>>;
    try {
      payment = await submitToSponsor({
        quote: offer.quote,
        deadline: Date.now() + paymentSubmitWindowMs,
        awaitsPayment: false,
        submit: quoteId =>
          client.submitSbtcSponsoredTransaction({
            quoteId,
            transaction: signedPayment.serialize(),
          }),
      });
    } catch (error) {
      if (error instanceof SponsoredBroadcastOutcomeUnknownError)
        return fail('paying', 'payment-unknown');
      logger.error('Failed to submit the sponsored fee payment', error);
      onSetTransactionStatus('idle');
      setProgress(null);
      void navigate(RouteUrls.BroadcastError, {
        state: { message: getSbtcSponsorshipErrorMessage(error) },
      });
      return;
    }

    const paymentTxid = payment.broadcast.txid;
    setProgress({ step: 'confirming' });
    const paymentStatus = await waitForPayment(paymentTxid, Date.now() + paymentTimeoutMs);
    if (paymentStatus === 'failed') return fail('confirming', 'payment-failed');
    if (paymentStatus === 'unconfirmed') return fail('confirming', 'payment-unconfirmed');

    setProgress({ step: 'calling' });
    try {
      const { broadcast } = await submitToSponsor({
        quote: payment.quote,
        deadline: Date.now() + callSubmitWindowMs,
        awaitsPayment: true,
        submit: quoteId =>
          client.submitSbtcSponsoredCall({
            quoteId,
            transaction: signedCall.serialize(),
            paymentTxid,
          }),
      });
      analytics.track('broadcast_transaction', { symbol: 'stx' });
      setProgress({ step: 'sent' });
      void sendMessageToOriginatingFrame(
        { frameId, tabId },
        createRpcSuccessResponse(method, { id: requestId, result: broadcast })
      );
      await delay(closeWindowDelayMs);
      closeWindow();
    } catch (error) {
      if (error instanceof SponsoredBroadcastOutcomeUnknownError)
        return fail('calling', 'call-unknown');
      fail('calling', 'call-not-sent', error);
    }
  }, [
    address,
    callOptions,
    fail,
    frameId,
    method,
    navigate,
    network,
    offer,
    onSetTransactionStatus,
    publicKey,
    quoteQuery,
    requestId,
    selectedFee.txFee.amount,
    signStacksTransaction,
    tabId,
    toast,
  ]);

  return { offer, isLoading, progress, approve };
}
