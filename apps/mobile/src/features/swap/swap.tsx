import { useState } from 'react';

import { useAccountRequest } from '@/hooks/use-account-request';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';

import { stxAsset } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import {
  getBitcoinTransactionFeesService,
  getMarketDataService,
  getStacksTransactionFeesService,
  getSwapService,
} from '@leather.io/services';
import { assertExistence, assertUnreachable } from '@leather.io/utils';

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

  const { fiatCurrencyPreference, networkPreference } = useSettings();
  const { accountRequest, stacksNetwork, stacksSigner, bitcoinPayer } = useSwapAccountContext();

  const swapState = useSwapState({
    accountRequest,
    marketDataService: getMarketDataService(),
    swapService: getSwapService(),
    quoteCurrencyPreference: fiatCurrencyPreference,
    stacksTransactionFeesService: getStacksTransactionFeesService(),
    bitcoinTransactionFeesService: getBitcoinTransactionFeesService(),
    bitcoinPayer,
    stacksSigner,
    signBitcoinPsbt: () => {
      throw new Error('unimplemented');
    },
    network: networkPreference,
    stacksNetwork,
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

// TODO: To be revisited in the form of a Provider during the extension swaps implementation
function useSwapAccountContext() {
  const accountRequest = useAccountRequest();
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const { fromAccountIndex } = useStacksSigners();
  const stacksSigner = fromAccountIndex(
    accountRequest.account.id.fingerprint,
    accountRequest.account.id.accountIndex
  )[0];
  const bitcoinAccounts = useBitcoinAccounts();
  const { nativeSegwit } = bitcoinAccounts.accountIndexByPaymentType(
    accountRequest.account.id.fingerprint,
    accountRequest.account.id.accountIndex
  );
  const bitcoinPayer = nativeSegwit?.derivePayer({ change: 0, addressIndex: 0 });

  assertExistence(stacksSigner, 'Stacks signer missing during swap initialization');
  assertExistence(bitcoinPayer, 'Bitcoin payer missing during swap initialization.');

  return { accountRequest, stacksNetwork, stacksSigner, bitcoinPayer };
}
