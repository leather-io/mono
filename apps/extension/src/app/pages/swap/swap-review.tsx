import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { captureMessage } from '@sentry/react';
import { Box } from 'leather-styles/jsx';

import { LiveSwapEstimate, matchLiveEstimate } from '@leather.io/state/swap';

import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { SwapReviewSummary } from '@app/pages/swap/components/review/swap-review-summary';
import type { SwapOutletContext } from '@app/pages/swap/swap-container';

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
  const { selectedQuote } = liveEstimate;
  const { baseAmount, targetAmount, baseAsset, targetAsset } = selectedQuote;

  return (
    <SwapReviewSummary
      baseAsset={baseAsset}
      targetAsset={targetAsset}
      baseAmount={baseAmount}
      targetAmount={targetAmount}
    />
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
