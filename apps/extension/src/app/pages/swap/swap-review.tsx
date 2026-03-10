import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { captureMessage } from '@sentry/react';
import BigNumber from 'bignumber.js';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { isNonNullish } from 'remeda';

import {
  LiveSwapEstimate,
  PRICE_IMPACT_WARNING_THRESHOLD,
  matchLiveEstimate,
  useSwapContext,
} from '@leather.io/state/swap';

import { formatCurrency, formatPercentage } from '@app/common/currency-formatter';
import { Card, Content, Page } from '@app/components/layout';
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

import { SlippageSelectorSheet } from './components/review/slippage-selector-sheet';
import { formatSwapRate, sumFeesInQuoteCurrency } from './swap-utils';

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
              loading: () => null,
              error: () => null,
              empty: () => null,
              success: liveEstimate => <SwapReviewContent liveEstimate={liveEstimate} />, // TODO:,
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
  const { state, actions } = useSwapContext();
  const [isSlippageSheetOpen, setIsSlippageSheetOpen] = useState(false);
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

  return (
    <Flex direction="column" gap="space.08">
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
          <SwapReviewDetailRow label="Min. receive" value={formatCurrency(minReceive)} />
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
          />
        )}

        {showPriceImpact && (
          <SwapReviewDetailRow
            label="Price impact"
            value={<PriceImpactValue value={priceImpactPercentage} />}
          />
        )}

        <SwapReviewDivider />

        <SwapReviewDetailRow label="Estimated fees" value={formatCurrency(totalFees)} />
      </SwapReviewDetails>

      <SlippageSelectorSheet
        isShowing={isSlippageSheetOpen}
        onClose={() => setIsSlippageSheetOpen(false)}
        slippage={state.slippage}
        onSave={actions.setSlippage}
      />
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
