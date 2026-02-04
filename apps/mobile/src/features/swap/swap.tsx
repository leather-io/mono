import { useState } from 'react';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { useSwapDependencies } from '@/features/swap/use-swap-dependencies';
import { useSwapDisabledPairs } from '@/features/swap/use-swap-disabled-pairs';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';

import { stxAsset } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { SwapProvider, useLiveSwapEstimate, useSwapContext } from '@leather.io/state/swap';

import { SwapFormScreen } from './screens/swap-form-screen';
import { SwapReviewScreen } from './screens/swap-review-screen';

type SwapScreen = 'form' | 'review';

interface SwapProps {
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
}

export function Swap({ baseAsset = stxAsset, targetAsset }: SwapProps) {
  const { fiatCurrencyPreference } = useSettings();
  const dependencies = useSwapDependencies();
  const disabledPairs = useSwapDisabledPairs();

  return (
    <SwapProvider
      dependencies={dependencies}
      quoteCurrencyPreference={fiatCurrencyPreference}
      baseAsset={baseAsset}
      targetAsset={targetAsset}
      disabledPairs={disabledPairs}
      trackEvent={analytics.track}
    >
      <SwapContent />
    </SwapProvider>
  );
}

function SwapContent() {
  const [currentScreen, setCurrentScreen] = useState<SwapScreen>('form');
  const swapContext = useSwapContext();

  const liveEstimate = useLiveSwapEstimate({
    quoteQuery: swapContext.quoteQuery,
    networkFeeQuery: swapContext.networkFeeQuery,
    baseMarketDataQuery: swapContext.baseMarketDataQuery,
    nativeAssetMarketDataQuery: swapContext.networkFeeAssetMarkedDataQuery,
  });

  function goToReview() {
    const { state, quoteQuery } = swapContext;
    analytics.track('swap_review_initiated', {
      baseSymbol: state.baseSwapAsset?.asset.symbol ?? '',
      targetSymbol: state.targetSwapAsset?.asset.symbol ?? '',
      baseAmount: Number(state.baseAmount),
      provider: quoteQuery.data?.selected?.provider ?? '',
    });
    setCurrentScreen('review');
  }

  function goToForm() {
    setCurrentScreen('form');
  }

  return (
    <Animated.View
      key={currentScreen}
      style={{ flex: 1 }}
      entering={FadeIn.easing(Easing.out(Easing.quad)).duration(150)}
      exiting={FadeOut.duration(150)}
    >
      {currentScreen === 'form' && (
        <SwapFormScreen liveEstimate={liveEstimate} onPressReview={goToReview} />
      )}
      {currentScreen === 'review' && (
        <SwapReviewScreen liveEstimate={liveEstimate} onGoBack={goToForm} />
      )}
    </Animated.View>
  );
}
