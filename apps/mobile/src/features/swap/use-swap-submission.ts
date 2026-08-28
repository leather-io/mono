import { useRef } from 'react';

import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { captureException } from '@sentry/react-native';
import { type UseMutationResult, useMutation } from '@tanstack/react-query';

import {
  SWAP_ACCIDENTAL_TAP_SUPPRESSION_MS,
  SWAP_SUBMISSION_DISPLAY_DURATION_MS,
  SWAP_SUCCESS_EXIT_TIMEOUT_MS,
  type SwapSubmissionQuoteSnapshot,
  type SwapSubmissionResult,
  type SwapSubmissionState,
  isSwapSigningCancelledError,
  useSwapContext,
} from '@leather.io/state/swap';
import { delay, ensureAsyncFunctionMinimumDuration } from '@leather.io/utils';

const swapSheetName = 'swap';

type SwapSubmissionMutation = UseMutationResult<
  SwapSubmissionResult,
  Error,
  SwapSubmissionQuoteSnapshot
>;

function toSubmissionState(mutation: SwapSubmissionMutation): SwapSubmissionState {
  const quote = mutation.variables;
  if (!quote) return { status: 'idle' };
  if (mutation.isPending) return { status: 'submitting', quote };
  if (mutation.isSuccess) {
    const result = mutation.data;
    if (result.status === 'submitted') return { status: 'success', quote };
    return {
      status: 'needs-attention',
      quote,
      attention: { reason: result.status, txid: result.txid },
    };
  }
  if (mutation.isError && !isSwapSigningCancelledError(mutation.error)) {
    return { status: 'failure', quote };
  }
  return { status: 'idle' };
}

export function useSwapSubmission() {
  const { submit } = useSwapContext();
  const { dismiss } = useBottomSheetModal();
  const mountedAtRef = useRef(Date.now());
  const inFlightRef = useRef(false);

  function dismissSwapSheet() {
    dismiss(swapSheetName);
  }

  const mutation = useMutation<SwapSubmissionResult, Error, SwapSubmissionQuoteSnapshot>({
    mutationFn() {
      return ensureAsyncFunctionMinimumDuration(submit, SWAP_SUBMISSION_DISPLAY_DURATION_MS)();
    },
    onSettled() {
      inFlightRef.current = false;
    },
    onSuccess(result) {
      if (result.status === 'submitted') {
        void delay(SWAP_SUCCESS_EXIT_TIMEOUT_MS).then(dismissSwapSheet);
        return;
      }
      const exception =
        result.status === 'sbtc-notification-failed'
          ? new Error('sBTC bridge deposit notification failed')
          : new Error('sBTC bridge deposit broadcast outcome unknown');
      captureException(exception, {
        level: 'error',
        tags: { swap: 'sbtc-bridge-deposit' },
        extra: result,
      });
    },
  });

  function confirm(quote: SwapSubmissionQuoteSnapshot) {
    if (Date.now() - mountedAtRef.current < SWAP_ACCIDENTAL_TAP_SUPPRESSION_MS) return;
    if (inFlightRef.current || mutation.isPending) return;
    inFlightRef.current = true;
    mutation.mutate(quote);
  }

  return {
    submission: toSubmissionState(mutation),
    confirm,
    reset: mutation.reset,
    dismissSwapSheet,
  };
}
