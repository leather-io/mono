import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { captureException } from '@sentry/react';

import {
  SWAP_ACCIDENTAL_TAP_SUPPRESSION_MS,
  SWAP_SUBMISSION_DISPLAY_DURATION_MS,
  SWAP_SUCCESS_EXIT_TIMEOUT_MS,
  type SwapSubmissionQuoteSnapshot,
  type SwapSubmissionState,
  isSwapSigningCancelledError,
  useSwapContext,
} from '@leather.io/state/swap';
import { ensureAsyncFunctionMinimumDuration } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

export function useSwapSubmission() {
  const { submit } = useSwapContext();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SwapSubmissionState>({ status: 'idle' });
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedAtRef = useRef(Date.now());
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  function confirm(quote: SwapSubmissionQuoteSnapshot) {
    if (Date.now() - mountedAtRef.current < SWAP_ACCIDENTAL_TAP_SUPPRESSION_MS) return;
    if (submission.status !== 'idle') return;

    setSubmission({ status: 'submitting', quote });
    const submitWithMinimumDuration = ensureAsyncFunctionMinimumDuration(
      submit,
      SWAP_SUBMISSION_DISPLAY_DURATION_MS
    );
    submitWithMinimumDuration()
      .then(result => {
        if (!isMountedRef.current) return;
        if (result.status !== 'submitted') {
          const exception =
            result.status === 'sbtc-notification-failed'
              ? new Error('sBTC bridge deposit notification failed')
              : new Error('sBTC bridge deposit broadcast outcome unknown');
          captureException(exception, {
            level: 'error',
            tags: { swap: 'sbtc-bridge-deposit' },
            extra: result,
          });
          setSubmission({
            status: 'needs-attention',
            quote,
            attention: { reason: result.status, txid: result.txid },
          });
          return;
        }
        setSubmission({ status: 'success', quote });
        exitTimerRef.current = setTimeout(() => {
          void navigate(RouteUrls.Activity);
        }, SWAP_SUCCESS_EXIT_TIMEOUT_MS);
      })
      .catch((error: unknown) => {
        if (!isMountedRef.current) return;
        if (isSwapSigningCancelledError(error)) {
          setSubmission({ status: 'idle' });
          return;
        }
        setSubmission({ status: 'failure', quote });
      });
  }

  function reset() {
    setSubmission({ status: 'idle' });
  }

  function goToActivity() {
    void navigate(RouteUrls.Activity);
  }

  return { submission, confirm, reset, goToActivity };
}
