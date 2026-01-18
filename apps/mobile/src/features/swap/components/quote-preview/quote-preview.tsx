import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { LiveSwapEstimate, SwapState } from '@leather.io/state/swap';
import { assertExistence, assertUnreachable } from '@leather.io/utils';

import { QuotePreviewConstrained } from './quote-preview-constrained';
import { QuotePreviewContent } from './quote-preview-content';
import { QuotePreviewEmptyState } from './quote-preview-empty-state';
import { QuotePreviewError } from './quote-preview-error';
import { QuotePreviewLoadingIndicator } from './quote-preview-loading-indicator';

interface QuotePreviewProps {
  state: SwapState;
  liveEstimate: LiveSwapEstimate;
}

export function QuotePreview({ state, liveEstimate }: QuotePreviewProps) {
  switch (liveEstimate.status) {
    case 'idle':
    case 'loading':
      if (state.baseAmount === '0' || !state.targetSwapAsset) return null;
      return (
        <Animated.View key="loading" entering={LoadingEntering} exiting={LoadingExiting}>
          <QuotePreviewLoadingIndicator />
        </Animated.View>
      );
    case 'error':
      return (
        <Animated.View key="error" entering={Entering} exiting={Exiting}>
          <QuotePreviewError error={liveEstimate.error} onRetry={liveEstimate.refetch} />
        </Animated.View>
      );
    case 'empty':
      return (
        <Animated.View key="empty" entering={Entering} exiting={Exiting}>
          <QuotePreviewEmptyState />
        </Animated.View>
      );
    case 'constrained':
      assertExistence(
        state.baseSwapAsset,
        "QuotePreview expects 'baseSwapAsset' for constrained state."
      );
      assertExistence(
        state.targetSwapAsset,
        "QuotePreview expects 'targetSwapAsset' for constrained state."
      );
      return (
        <Animated.View key="constrained" entering={Entering} exiting={Exiting}>
          <QuotePreviewConstrained
            constraints={liveEstimate.constraints}
            baseAsset={state.baseSwapAsset.asset}
            targetAsset={state.targetSwapAsset.asset}
          />
        </Animated.View>
      );
    case 'success':
      assertExistence(state.baseSwapAsset, "QuotePreview expects 'baseSwapAsset' to be set.");
      assertExistence(state.targetSwapAsset, "QuotePreview expects 'targetSwapAsset' to be set.");
      return (
        <Animated.View key="success" entering={Entering} exiting={Exiting}>
          <QuotePreviewContent
            baseAsset={state.baseSwapAsset.asset}
            targetAsset={state.targetSwapAsset.asset}
            liveEstimate={liveEstimate}
          />
        </Animated.View>
      );
    default:
      assertUnreachable(liveEstimate);
  }
}

const Entering = FadeIn.easing(Easing.out(Easing.cubic)).duration(160);
const Exiting = FadeOut.easing(Easing.out(Easing.cubic)).duration(160);
// Loading transitions get special treatment to match the underlying SkeletonLoader animation
const LoadingEntering = FadeIn.easing(Easing.out(Easing.quad)).duration(600);
const LoadingExiting = FadeOut.easing(Easing.out(Easing.quad)).duration(200);
