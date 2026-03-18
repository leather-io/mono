import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { captureMessage } from '@sentry/react';
import BigNumber from 'bignumber.js';
import { AnimatePresence } from 'framer-motion';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { isNonNullish } from 'remeda';

import {
  LiveSwapEstimate,
  PRICE_IMPACT_WARNING_THRESHOLD,
  matchLiveEstimate,
  useSwapContext,
} from '@leather.io/state/swap';
import { Button } from '@leather.io/ui';
import { ensureAsyncFunctionMinimumDuration } from '@leather.io/utils';

import { formatCurrency, formatPercentage } from '@app/common/currency-formatter';
import { Card, Content, Page } from '@app/components/layout';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { PageHeader } from '@app/features/container/headers/page.header';
import { QuoteRefetchIndicator } from '@app/pages/swap/components/quote-preview/quote-refetch-indicator';
import { PriceImpactValue } from '@app/pages/swap/components/review/price-impact-value';
import { SwapReviewAccountDetails } from '@app/pages/swap/components/review/swap-review-account-details';
import {
  SwapReviewDetailRow,
  SwapReviewDetailToggle,
  SwapReviewDetails,
  SwapReviewDivider,
} from '@app/pages/swap/components/review/swap-review-details';
import { SwapReviewSummary } from '@app/pages/swap/components/review/swap-review-summary';
import type { SwapOutletContext } from '@app/pages/swap/swap-container';

import { FeesTooltipContent } from './components/review/fees-tooltip-content';
import { SlippageSelectorSheet } from './components/review/slippage-selector-sheet';
import { SwapReviewEmptyState } from './components/review/swap-review-empty-state';
import { SwapReviewErrorState } from './components/review/swap-review-error-state';
import { SwapReviewInfoTooltip } from './components/review/swap-review-info-tooltip';
import { SwapSubmissionOverlay } from './components/review/swap-submission-overlay';
import { formatSwapRate, sumFeesInQuoteCurrency } from './swap-utils';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'failure';

const submissionDisplayDuration = 1800;
const successfulExitTimeout = 1200;

const supportedLiveEstimateStatuses: LiveSwapEstimate['status'][] = [
  'loading',
  'empty',
  'success',
  'error',
];

export function SwapReview() {
  const { liveEstimate } = useOutletContext<SwapOutletContext>();
  const navigate = useNavigate();
  useSwapReviewStatusGuard(liveEstimate, () => navigate(-1));

  return (
    <Box width="100%">
      <PageHeader title="Swap" />
      <Content>
        <Page>
          <Card>
            {matchLiveEstimate(liveEstimate, {
              idle: () => null,
              constrained: () => null,
              loading: () => <LoadingSpinner />,
              error: estimate => <SwapReviewErrorState onRetry={estimate.refetch} />,
              empty: () => <SwapReviewEmptyState onBack={() => navigate(-1)} />,
              success: liveEstimate => <SwapReviewContent liveEstimate={liveEstimate} />,
            })}
          </Card>
        </Page>
      </Content>
    </Box>
  );
}

interface SwapReviewContentProps {
  liveEstimate: Extract<LiveSwapEstimate, { status: 'success' }>;
}

function SwapReviewContent({ liveEstimate }: SwapReviewContentProps) {
  const { state, actions, canSubmit, submit } = useSwapContext();
  const navigate = useNavigate();
  const [isSlippageSheetOpen, setIsSlippageSheetOpen] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const onSubmitSwap = ensureAsyncFunctionMinimumDuration(submit, submissionDisplayDuration);

  const { selectedQuote, isRefetching, intervalState, fees } = liveEstimate;
  const {
    baseAmount,
    targetAmount,
    baseAsset,
    targetAsset,
    swapRate,
    slippageApplicable,
    minReceive,
    priceImpactPercentage,
  } = selectedQuote;
  const showPriceImpact = shouldShowPriceImpact(priceImpactPercentage);
  const totalFees = sumFeesInQuoteCurrency(fees.network.quote, fees.provider?.quote);

  function handleConfirm() {
    setSubmissionStatus('submitting');
    onSubmitSwap()
      .then(() => {
        setSubmissionStatus('success');
        setTimeout(() => {
          void navigate(-2);
        }, successfulExitTimeout);
      })
      .catch(() => {
        setSubmissionStatus('failure');
      });
  }

  return (
    <Flex direction="column" gap="space.08" position="relative" flex={1}>
      <SwapReviewSummary
        baseAsset={baseAsset}
        targetAsset={targetAsset}
        baseAmount={baseAmount}
        targetAmount={targetAmount}
      />
      <SwapReviewDetails isRefetching={isRefetching}>
        <SwapReviewAccountDetails />

        <SwapReviewDivider />

        <SwapReviewDetailRow
          label="Rate"
          value={
            <Flex alignItems="center" gap="space.02">
              <QuoteRefetchIndicator
                interval={intervalState.interval}
                lastStartedAt={intervalState.lastStartedAt}
                nextRunTime={intervalState.nextRunTime}
              />
              <styled.span textStyle="label.02">
                {formatSwapRate({ swapRate, baseAsset, targetAsset })}
              </styled.span>
            </Flex>
          }
        />

        {isNonNullish(minReceive) && (
          <SwapReviewDetailRow
            label="Min. receive"
            value={formatCurrency(minReceive)}
            info={
              <SwapReviewInfoTooltip label="The guaranteed minimum amount you'll receive based on your slippage tolerance. If the final amount falls below this, the transaction will automatically revert." />
            }
          />
        )}

        {slippageApplicable && (
          <SwapReviewDetailRow
            label="Slippage"
            value={
              <SwapReviewDetailToggle
                onClick={() => setIsSlippageSheetOpen(true)}
                label={formatPercentage(state.slippage)}
              />
            }
            info={
              <SwapReviewInfoTooltip label="The maximum price change you're willing to accept between when you submit and when your swap executes. If the price moves beyond this threshold, the transaction will revert." />
            }
          />
        )}

        {showPriceImpact && (
          <SwapReviewDetailRow
            label="Price impact"
            value={<PriceImpactValue value={priceImpactPercentage} />}
            info={
              <SwapReviewInfoTooltip label="The difference between the market price and the price you'll receive due to your trade size relative to the available liquidity. Larger trades typically have higher price impact." />
            }
          />
        )}

        <SwapReviewDivider />

        <SwapReviewDetailRow
          label="Estimated fees"
          value={formatCurrency(totalFees)}
          info={
            <SwapReviewInfoTooltip
              label={<FeesTooltipContent fees={fees} provider={selectedQuote.provider} />}
            />
          }
        />
      </SwapReviewDetails>

      <Flex direction="column" gap="space.04" mt="auto" alignItems="center">
        <styled.span textStyle="caption.01" textAlign="center" color="ink.text-subdued">
          Make sure everything looks correct.
          <br />
          Confirmed transactions cannot be undone.
        </styled.span>
        <Button
          fullWidth
          disabled={!canSubmit || submissionStatus !== 'idle'}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </Flex>

      <SlippageSelectorSheet
        isShowing={isSlippageSheetOpen}
        onClose={() => setIsSlippageSheetOpen(false)}
        slippage={state.slippage}
        onSave={actions.setSlippage}
      />

      <AnimatePresence>
        {submissionStatus !== 'idle' && (
          <SwapSubmissionOverlay
            baseAsset={baseAsset}
            targetAsset={targetAsset}
            baseAmount={baseAmount}
            targetAmount={targetAmount}
            status={submissionStatus}
            onReset={() => setSubmissionStatus('idle')}
          />
        )}
      </AnimatePresence>
    </Flex>
  );
}

function useSwapReviewStatusGuard(liveEstimate: LiveSwapEstimate, exitReview: () => void) {
  useEffect(() => {
    if (!supportedLiveEstimateStatuses.includes(liveEstimate.status)) {
      captureMessage(`Swap review screen reached with ${liveEstimate.status} estimate state.`, {
        level: 'warning',
        tags: { swap: 'review' },
      });
      exitReview();
    }
  }, [liveEstimate.status, exitReview]);
}

function shouldShowPriceImpact(
  priceImpactPercentage: BigNumber | null
): priceImpactPercentage is BigNumber {
  return (
    isNonNullish(priceImpactPercentage) &&
    priceImpactPercentage.isGreaterThanOrEqualTo(PRICE_IMPACT_WARNING_THRESHOLD)
  );
}
