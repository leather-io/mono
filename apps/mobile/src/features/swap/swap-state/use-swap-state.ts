import { useReducer } from 'react';

import { useNetworkFee } from '@/features/swap/swap-state/hooks/use-network-fee';
import * as btc from '@scure/btc-signer';
import { StacksNetwork } from '@stacks/network';

import { BitcoinNativeSegwitPayer } from '@leather.io/bitcoin';
import {
  AccountAddresses,
  NetworkConfiguration,
  QuoteCurrency,
  SwappableFungibleCryptoAsset,
} from '@leather.io/models';
import {
  AccountSwapAsset,
  BitcoinTransactionFeesService,
  MarketDataService,
  StacksTransactionFeesService,
  SwapService,
} from '@leather.io/services';
import { StacksSigner } from '@leather.io/stacks';
import { getAssetId } from '@leather.io/utils';

import { createSwapActions } from './actions/swap-actions';
import { useDerivedAmounts } from './hooks/use-derived-amounts';
import { useIsSendingMax } from './hooks/use-is-sending-max';
import { useSecondaryAmount } from './hooks/use-secondary-amount';
import { useSwapAssetReconciliation } from './hooks/use-swap-asset-reconciliation';
import { useSwapExecutability } from './hooks/use-swap-executability';
import { useSwapQuotes } from './hooks/use-swap-quotes';
import { useSwapValidation } from './hooks/use-swap-validation';
import { swapReducer } from './swap-state.reducer';
import { SwapInternalState, UseSwapStateResult } from './swap-state.types';
import { DEFAULT_SLIPPAGE_PERCENTAGE } from './swap.constants';
import {
  useAccountBaseSwapAssetsQuery,
  useAccountTargetSwapAssetsQuery,
  useAssetMarketDataQuery,
} from './swap.queries';

export interface UseSwapStateProps {
  accountRequest: { account: AccountAddresses };
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
  quoteCurrencyPreference: QuoteCurrency;
  swapService: SwapService;
  marketDataService: MarketDataService;
  stacksTransactionFeesService: StacksTransactionFeesService;
  bitcoinTransactionFeesService: BitcoinTransactionFeesService;
  bitcoinPayer: BitcoinNativeSegwitPayer;
  stacksSigner: StacksSigner;
  signBitcoinPsbt: (psbt: Uint8Array) => Promise<btc.Transaction>;
  network: NetworkConfiguration;
  stacksNetwork: StacksNetwork;
}

export function useSwapState({
  accountRequest,
  swapService,
  marketDataService,
  stacksTransactionFeesService,
  bitcoinTransactionFeesService,
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
  stacksSigner,
  stacksNetwork,
  network,
  bitcoinPayer,
}: UseSwapStateProps): UseSwapStateResult {
  const [state, dispatch] = useReducer(
    swapReducer,
    { baseAsset, targetAsset, quoteCurrencyPreference },
    initializeState
  );

  const baseMarketDataQuery = useAssetMarketDataQuery({
    marketDataService,
    asset: state.baseSwapAsset?.asset,
  });

  const targetMarketDataQuery = useAssetMarketDataQuery({
    marketDataService,
    asset: state.targetSwapAsset?.asset,
  });

  const baseAssetsQuery = useAccountBaseSwapAssetsQuery({
    accountRequest,
    swapService,
  });

  const targetAssetsQuery = useAccountTargetSwapAssetsQuery({
    swapService,
    accountRequest,
    baseId: state.baseSwapAsset ? getAssetId(state.baseSwapAsset?.asset) : undefined,
  });

  useSwapAssetReconciliation({
    baseSwapAssets: baseAssetsQuery.data,
    targetSwapAssets: targetAssetsQuery.data,
    dispatch,
  });

  const { derivedAmounts, lockDerivedAmountsForNextRender } = useDerivedAmounts(
    state,
    baseMarketDataQuery.data
  );

  const secondaryAmount = useSecondaryAmount({
    state,
    baseMarketDataQuery,
    derivedAmounts,
  });

  const isSendingMax = useIsSendingMax({
    baseSwapAsset: state.baseSwapAsset,
    inputCurrencyMode: state.inputCurrencyMode,
    derivedAmounts,
  });

  const { quoteQuery } = useSwapQuotes({
    swapService,
    state,
    derivedAmounts,
    baseMarketData: baseMarketDataQuery.data,
    targetMarketData: targetMarketDataQuery.data,
  });

  const networkFeeQuery = useNetworkFee({
    state,
    derivedAmounts,
    isSendingMax,
    swapService,
    quote: quoteQuery.data?.selected?.rawSwapQuote,
    baseAmount: derivedAmounts.crypto?.amount
      .shiftedBy(-derivedAmounts.crypto?.decimals)
      .toNumber(),
    slippage: state.slippage,
    stacksTransactionFeesService,
    bitcoinTransactionFeesService,
    bitcoinPayer,
    network,
    stacksNetwork,
    stacksSigner,
    accountRequest,
  });

  const validation = useSwapValidation({ state, derivedAmounts });

  const actions = createSwapActions({
    dispatch,
    lockDerivedAmountsForNextRender,
    state,
    derivedAmounts,
  });

  const isSwapExecutable = useSwapExecutability({ validation, quoteQuery, derivedAmounts });

  return {
    state: {
      ...state,
      secondaryAmount,
      assetFlippingAllowed: isAssetFlippingAllowed(state.baseSwapAsset, state.targetSwapAsset),
      isSendingMax,
    },
    actions,
    validation,
    baseAssetsQuery,
    targetAssetsQuery,
    quoteQuery,
    networkFeeQuery,
    isSwapExecutable,
  };
}

export interface InitializeStateParams {
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
  quoteCurrencyPreference: QuoteCurrency;
}

function initializeState({
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
}: InitializeStateParams): SwapInternalState {
  const baseSwapAsset = baseAsset ? { asset: baseAsset, providerAssets: [] } : null;
  const targetSwapAsset = targetAsset ? { asset: targetAsset, providerAssets: [] } : null;

  return {
    baseSwapAsset: baseSwapAsset,
    targetSwapAsset: targetSwapAsset,
    pairReconciliation: { base: 'pending', target: 'pending' },
    nonce: undefined,
    baseAmount: '0',
    quoteCurrencyPreference,
    quoteStrategy: 'best',
    inputCurrencyMode: 'crypto',
    slippage: DEFAULT_SLIPPAGE_PERCENTAGE,
    selectingAsset: null,
    feeTier: 'standard',
    customFee: null,
  };
}

function isAssetFlippingAllowed(
  baseSwapAsset: AccountSwapAsset | null,
  targetSwapAsset: AccountSwapAsset | null
) {
  return baseSwapAsset !== null && targetSwapAsset !== null;
}
