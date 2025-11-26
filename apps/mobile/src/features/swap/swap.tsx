import { useState } from 'react';
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig } from 'react-native-reanimated';

import { useLiveSwapEstimate } from '@/features/swap/hooks/use-live-swap-estimate';
import { useSwapDependencies } from '@/features/swap/use-swap-dependencies';
import { useSettings } from '@/store/settings/settings';

import { stxAsset } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { SwapFormScreen } from './screens/swap-form-screen';
import { SwapReviewScreen } from './screens/swap-review-screen';
import { useSwapState } from './swap-state/use-swap-state';

type SwapScreen = 'form' | 'review';

interface SwapProps {
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
}

export function Swap({ baseAsset = stxAsset, targetAsset }: SwapProps) {
  const [currentScreen, setCurrentScreen] = useState<SwapScreen>('form');
  const { fiatCurrencyPreference } = useSettings();
  const dependencies = useSwapDependencies();

  const swapStateResult = useSwapState({
    dependencies,
    quoteCurrencyPreference: fiatCurrencyPreference,
    baseAsset,
    targetAsset,
  });

  const liveEstimate = useLiveSwapEstimate({
    quoteQuery: swapStateResult.quoteQuery,
    networkFeeQuery: swapStateResult.networkFeeQuery,
    baseMarketDataQuery: swapStateResult.baseMarketDataQuery,
    nativeAssetMarketDataQuery: swapStateResult.nativeAssetMarketDataQuery,
  });

  function goToReview() {
    setCurrentScreen('review');
  }

  function goToForm() {
    setCurrentScreen('form');
  }

  switch (currentScreen) {
    case 'form':
      return (
        <Animated.View
          key="form"
          style={{ flex: 1 }}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
        >
          <LayoutAnimationConfig skipEntering>
            <SwapFormScreen
              swapStateResult={swapStateResult}
              liveEstimate={liveEstimate}
              onPressReview={goToReview}
            />
          </LayoutAnimationConfig>
        </Animated.View>
      );
    case 'review':
      return (
        <Animated.View
          key="review"
          style={{ flex: 1 }}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
        >
          <SwapReviewScreen
            swapStateResult={swapStateResult}
            liveEstimate={liveEstimate}
            onPressBack={goToForm}
          />
        </Animated.View>
      );
    default:
      assertUnreachable(currentScreen);
  }
}
