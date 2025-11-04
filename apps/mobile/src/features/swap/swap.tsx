import { useState } from 'react';

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

  const swapState = useSwapState({
    dependencies,
    quoteCurrencyPreference: fiatCurrencyPreference,
    baseAsset,
    targetAsset,
  });

  function goToReview() {
    setCurrentScreen('review');
  }

  function goToForm() {
    setCurrentScreen('form');
  }

  switch (currentScreen) {
    case 'form':
      return <SwapFormScreen swapState={swapState} onPressReview={goToReview} />;
    case 'review':
      return <SwapReviewScreen swapState={swapState} onPressBack={goToForm} />;
    default:
      assertUnreachable(currentScreen);
  }
}
