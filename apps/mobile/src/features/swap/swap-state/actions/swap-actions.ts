import { getProtocolStrategy } from '@/features/swap/swap-state/strategies/protocol/protocol';
import {
  calculatePercentageAmount,
  convertMoneyToInputValue,
} from '@/features/swap/swap-state/utils/amount-operations';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { TransactionFeeTier } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import {
  DerivedAmounts,
  PresetPercentage,
  SwapActionObject,
  SwapActions,
  SwapInternalState,
} from '../swap-state.types';

interface CreateSwapActionsParams {
  dispatch: (action: SwapActionObject) => void;
  lockDerivedAmountsForNextRender: () => void;
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
}

export function createSwapActions({
  dispatch,
  lockDerivedAmountsForNextRender,
  state,
  derivedAmounts,
}: CreateSwapActionsParams): SwapActions {
  return {
    setBaseSwapAsset(asset: AccountSwapAsset) {
      dispatch({ type: 'SET_BASE_SWAP_ASSET', payload: asset });
    },

    setTargetSwapAsset(asset: AccountSwapAsset) {
      dispatch({ type: 'SET_TARGET_SWAP_ASSET', payload: asset });
    },

    setBaseAmount(amount: string) {
      dispatch({ type: 'SET_BASE_AMOUNT', payload: amount });
    },

    setBaseAmountByPercentage(percentage: PresetPercentage) {
      if (!state.baseSwapAsset?.balance) {
        return;
      }

      const { balance } = state.baseSwapAsset;

      const rate = balance.quote.availableBalance.amount.dividedBy(
        balance.crypto.availableBalance.amount
      );

      const availableBalance = whenInputCurrencyMode(state.inputCurrencyMode)({
        crypto: balance.crypto.availableBalance,
        quote: balance.quote.availableBalance,
      });

      const cryptoSpendableAmount = getProtocolStrategy(
        state.baseSwapAsset.asset.protocol
      ).resolveSpendableAmount(balance.crypto);

      const quoteSpendableAmount = createMoney(
        cryptoSpendableAmount.amount.times(rate),
        balance.quote.availableBalance.symbol,
        balance.quote.availableBalance.decimals
      );

      const spendableAmount = whenInputCurrencyMode(state.inputCurrencyMode)({
        crypto: cryptoSpendableAmount,
        quote: quoteSpendableAmount,
      });

      const isSendingMax = percentage === 1;
      const percentageSource = isSendingMax ? spendableAmount : availableBalance;

      dispatch({
        type: 'SET_BASE_AMOUNT',
        payload: calculatePercentageAmount(percentageSource, percentage),
      });
    },

    toggleInputCurrencyMode() {
      const nextBaseAmount = whenInputCurrencyMode(state.inputCurrencyMode)({
        crypto: convertMoneyToInputValue(derivedAmounts.quote),
        quote: convertMoneyToInputValue(derivedAmounts.crypto),
      });
      lockDerivedAmountsForNextRender();
      dispatch({
        type: 'TOGGLE_INPUT_CURRENCY_MODE',
        payload: { nextBaseAmount },
      });
    },

    setSlippage(slippage: number) {
      dispatch({ type: 'SET_SLIPPAGE', payload: slippage });
    },

    setNonce(nonce: number) {
      dispatch({ type: 'SET_NONCE', payload: nonce });
    },

    clearAssetSelection() {
      dispatch({ type: 'CLEAR_ASSET_SELECTION' });
    },

    flipAssets() {
      dispatch({ type: 'FLIP_ASSETS' });
    },

    openAssetSelector(type: 'base' | 'target') {
      dispatch({ type: 'OPEN_ASSET_SELECTOR', payload: type });
    },

    closeAssetSelector() {
      dispatch({ type: 'CLOSE_ASSET_SELECTOR' });
    },
    setFeeTier(tier: TransactionFeeTier) {
      dispatch({ type: 'SET_FEE_TIER', payload: tier });
    },
    setCustomFee(fee: number) {
      dispatch({ type: 'SET_CUSTOM_FEE', payload: fee });
    },
  };
}
