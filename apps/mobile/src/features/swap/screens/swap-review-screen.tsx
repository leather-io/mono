import { useEffect, useRef } from 'react';

import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { FeesInfoSheet } from '@/features/swap/components/fees-info-sheet';
import { MinReceiveInfoSheet } from '@/features/swap/components/min-receive-info-sheet';
import { PriceImpactInfoSheet } from '@/features/swap/components/price-impact-info-sheet';
import { QuoteRefetchIndicator } from '@/features/swap/components/quote-refetch-indicator';
import { PriceImpactValue } from '@/features/swap/components/review/price-impact-value';
import { SwapReviewAccountDetails } from '@/features/swap/components/review/swap-review-account-details';
import {
  SwapReviewDetailRow,
  SwapReviewDetailToggle,
  SwapReviewDetails,
  SwapReviewDivider,
} from '@/features/swap/components/review/swap-review-details';
import { SwapReviewEmptyState } from '@/features/swap/components/review/swap-review-empty-state';
import { SwapReviewErrorState } from '@/features/swap/components/review/swap-review-error-state';
import { SwapReviewFooter } from '@/features/swap/components/review/swap-review-footer';
import { SwapReviewLoadingState } from '@/features/swap/components/review/swap-review-loading-state';
import { SwapReviewSummary } from '@/features/swap/components/review/swap-review-summary';
import { SwapSubmissionOverlay } from '@/features/swap/components/review/swap-submission-overlay';
import { SlippageInfoSheet } from '@/features/swap/components/slippage-info-sheet';
import { SlippageSelectorSheet } from '@/features/swap/components/slippage-selector/slippage-selector-sheet';
import { formatSwapRate, sumFeesInQuoteCurrency } from '@/features/swap/swap.utils';
import { useSwapSubmission } from '@/features/swap/use-swap-submission';
import { useAndroidBackHandler } from '@/hooks/use-android-back-handler';
import { formatCurrency, formatPercentage } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';
import { captureMessage } from '@sentry/react-native';
import BigNumber from 'bignumber.js';
import { isNonNullish } from 'remeda';

import {
  LiveSwapEstimate,
  PRICE_IMPACT_WARNING_THRESHOLD,
  type SwapSubmissionQuoteSnapshot,
  matchLiveEstimate,
  useSwapContext,
} from '@leather.io/state/swap';
import { Box, Button, SheetInstance, Text } from '@leather.io/ui/native';

const supportedLiveEstimateStatuses: LiveSwapEstimate['status'][] = [
  'loading',
  'empty',
  'success',
  'error',
];

interface SwapReviewScreenProps {
  liveEstimate: LiveSwapEstimate;
  onGoBack(): void;
  onSubmissionActiveChange(active: boolean): void;
}

export function SwapReviewScreen({
  liveEstimate,
  onGoBack,
  onSubmissionActiveChange,
}: SwapReviewScreenProps) {
  const { submission, confirm, reset, dismissSwapSheet } = useSwapSubmission();
  const isSubmissionActive = submission.status !== 'idle';

  useEffect(() => {
    onSubmissionActiveChange(isSubmissionActive);
    return () => onSubmissionActiveChange(false);
  }, [isSubmissionActive, onSubmissionActiveChange]);

  function handleGoBack() {
    if (isSubmissionActive) return;
    onGoBack();
  }

  useAndroidBackHandler(handleGoBack);
  useSwapReviewStatusGuard(liveEstimate, isSubmissionActive, onGoBack);

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t`Review Swap`}
          leftElement={<HeaderBackButton onPress={handleGoBack} />}
        />
      }
    >
      <Box flex={1}>
        {matchLiveEstimate(liveEstimate, {
          idle: () => null,
          constrained: () => null,
          loading: () => <SwapReviewLoadingState />,
          error: liveEstimate => <SwapReviewErrorState onRetry={liveEstimate.refetch} />,
          empty: () => <SwapReviewEmptyState onBack={onGoBack} />,
          success: liveEstimate => (
            <SwapReviewContent
              liveEstimate={liveEstimate}
              isSubmissionActive={isSubmissionActive}
              onConfirm={confirm}
            />
          ),
        })}

        {submission.status !== 'idle' && (
          <SwapSubmissionOverlay
            baseAsset={submission.quote.baseAsset}
            targetAsset={submission.quote.targetAsset}
            baseAmount={submission.quote.baseAmount}
            targetAmount={submission.quote.targetAmount}
            status={submission.status}
            attention={submission.status === 'needs-attention' ? submission.attention : undefined}
            onReset={reset}
            onDismiss={dismissSwapSheet}
          />
        )}
      </Box>
    </FullHeightSheetLayout>
  );
}

interface SwapReviewContentProps {
  liveEstimate: Extract<LiveSwapEstimate, { status: 'success' }>;
  isSubmissionActive: boolean;
  onConfirm(quote: SwapSubmissionQuoteSnapshot): void;
}

function SwapReviewContent({
  liveEstimate,
  isSubmissionActive,
  onConfirm,
}: SwapReviewContentProps) {
  const swapState = useSwapContext();
  const slippageSheetRef = useRef<SheetInstance>(null);
  const { state } = swapState;
  const { selectedQuote, fees, intervalState, isRefetching } = liveEstimate;
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
  const totalFees = sumFeesInQuoteCurrency(fees.network.quote, fees.provider?.quote);
  const showPriceImpact = shouldShowPriceImpact(priceImpactPercentage);

  function handleConfirm() {
    onConfirm({ baseAsset, targetAsset, baseAmount, targetAmount });
  }

  return (
    <Box gap="8" flex={1}>
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
          label={t`Rate`}
          value={
            <Box flexDirection="row" alignItems="center" gap="2">
              <QuoteRefetchIndicator
                interval={intervalState.interval}
                lastStartedAt={intervalState.lastStartedAt}
                nextRunTime={intervalState.nextRunTime}
              />
              <Text variant="label02">{formatSwapRate({ swapRate, baseAsset, targetAsset })}</Text>
            </Box>
          }
        />

        {isNonNullish(minReceive) && (
          <SwapReviewDetailRow
            label={t`Min. receive`}
            value={formatCurrency(minReceive)}
            info={<MinReceiveInfoSheet />}
          />
        )}

        {slippageApplicable && (
          <SwapReviewDetailRow
            label={t`Slippage`}
            value={
              <SwapReviewDetailToggle
                label={formatPercentage(state.slippage)}
                onPress={() => slippageSheetRef.current?.present()}
              />
            }
            info={<SlippageInfoSheet />}
          />
        )}

        {showPriceImpact && (
          <SwapReviewDetailRow
            label={t`Price impact`}
            value={<PriceImpactValue value={priceImpactPercentage} />}
            info={<PriceImpactInfoSheet />}
          />
        )}

        <SwapReviewDivider />

        <SwapReviewDetailRow
          label={t`Estimated fees`}
          value={formatCurrency(totalFees)}
          info={<FeesInfoSheet fees={fees} provider={selectedQuote.provider} />}
        />
      </SwapReviewDetails>

      <SwapReviewFooter>
        <Text
          variant="caption01"
          textAlign="center"
          color="ink.text-subdued"
        >{t`Make sure everything looks correct.\nConfirmed transactions cannot be undone.`}</Text>

        <Button
          disabled={!swapState.canSubmit || isSubmissionActive}
          onPress={handleConfirm}
        >{t`Confirm`}</Button>
      </SwapReviewFooter>

      <SlippageSelectorSheet
        ref={slippageSheetRef}
        value={swapState.state.slippage}
        onSave={swapState.actions.setSlippage}
      />
    </Box>
  );
}

function useSwapReviewStatusGuard(
  liveEstimate: LiveSwapEstimate,
  isSubmissionActive: boolean,
  exitReview: () => void
) {
  useEffect(() => {
    if (isSubmissionActive) return;
    if (!supportedLiveEstimateStatuses.includes(liveEstimate.status)) {
      captureMessage(`Swap review screen reached with ${liveEstimate.status} estimate state.`, {
        level: 'warning',
        tags: { swap: 'review' },
      });
      exitReview();
    }
  }, [liveEstimate.status, isSubmissionActive, exitReview]);
}

function shouldShowPriceImpact(
  priceImpactPercentage: BigNumber | null
): priceImpactPercentage is BigNumber {
  return (
    isNonNullish(priceImpactPercentage) &&
    priceImpactPercentage.isGreaterThanOrEqualTo(PRICE_IMPACT_WARNING_THRESHOLD)
  );
}
