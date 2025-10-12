import { useState } from 'react';

import { useAccountRequest } from '@/hooks/use-account-request';
import { useSettings } from '@/store/settings/settings';
import { AssetVisibility } from '@/store/settings/utils';

import { stxAsset } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { getMarketDataService, getSwapService } from '@leather.io/services';
import { assertUnreachable, getAssetId, serializeAssetId } from '@leather.io/utils';

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

  const { assetVisibility, fiatCurrencyPreference } = useSettings();
  const accountRequest = useAccountRequest();
  const swapState = useSwapState({
    accountRequest,
    marketDataService: getMarketDataService(),
    swapService: getSwapService(),
    quoteCurrencyPreference: fiatCurrencyPreference,
    isAssetAllowed: createAssetVisibilityPredicate(assetVisibility),
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

function createAssetVisibilityPredicate(assetVisibility: AssetVisibility) {
  return (asset: SwappableFungibleCryptoAsset) =>
    assetVisibility[serializeAssetId(getAssetId(asset))] !== false;
}
