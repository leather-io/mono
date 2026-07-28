import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { useSwapContext } from '@leather.io/state/swap';
import { ensureAsyncFunctionMinimumDuration } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { isSigningCancelledError } from '../swap-utils';

const submissionDisplayDuration = 1800;
const successfulExitTimeout = 1200;
const accidentalClickSuppressionMs = 500;

export interface SwapSubmissionQuoteSnapshot {
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
}

type SwapSubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' | 'success' | 'failure'; quote: SwapSubmissionQuoteSnapshot };

export function useSwapSubmission() {
  const { submit } = useSwapContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [submission, setSubmission] = useState<SwapSubmissionState>({ status: 'idle' });
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedAtRef = useRef(Date.now());
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  function returnToReviewRoute() {
    const { pathname } = locationRef.current;
    const reviewSegment = '/review';
    const reviewIndex = pathname.indexOf(reviewSegment);
    const isOnReviewChildRoute =
      reviewIndex !== -1 && pathname.length > reviewIndex + reviewSegment.length;
    if (isOnReviewChildRoute) {
      void navigate(pathname.slice(0, reviewIndex + reviewSegment.length), { replace: true });
    }
  }

  function confirm(quote: SwapSubmissionQuoteSnapshot) {
    if (Date.now() - mountedAtRef.current < accidentalClickSuppressionMs) return;
    if (submission.status !== 'idle') return;

    setSubmission({ status: 'submitting', quote });
    const submitWithMinimumDuration = ensureAsyncFunctionMinimumDuration(
      submit,
      submissionDisplayDuration
    );
    submitWithMinimumDuration()
      .then(() => {
        setSubmission({ status: 'success', quote });
        exitTimerRef.current = setTimeout(() => {
          void navigate(RouteUrls.Activity);
        }, successfulExitTimeout);
      })
      .catch((error: unknown) => {
        returnToReviewRoute();
        if (isSigningCancelledError(error)) {
          setSubmission({ status: 'idle' });
          return;
        }
        setSubmission({ status: 'failure', quote });
      });
  }

  function reset() {
    setSubmission({ status: 'idle' });
  }

  return { submission, confirm, reset };
}
