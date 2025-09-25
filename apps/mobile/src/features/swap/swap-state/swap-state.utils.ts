import { SecondaryAmount, SwapInternalState } from '@/features/swap/swap-state/swap-state.types';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import BigNumber from 'bignumber.js';
import { filter, pipe, sortBy } from 'remeda';

import {
  FungibleCryptoAsset,
  Money,
  isBtcAsset,
  isSip10Asset,
  isStxAsset,
} from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

export function convertMoneyToInputValue(money: Money | null): string {
  if (!money) return '';
  return money.amount
    .shiftedBy(-money.decimals)
    .toFixed(money.decimals, BigNumber.ROUND_HALF_UP)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}

export function adjustAmountForDecimals(amount: string, maxDecimals: number): string {
  if (amount === '') return amount;

  const [whole = '', fractional = ''] = amount.split('.');

  if (maxDecimals === 0) {
    return whole;
  }

  if (fractional.length <= maxDecimals) {
    return amount;
  }

  const truncatedFractional = fractional.substring(0, maxDecimals);
  return truncatedFractional ? `${whole}.${truncatedFractional}` : whole;
}

interface ComputeSecondaryAmountStateParams {
  state: SwapInternalState;
  queryStatus: 'pending' | 'success' | 'error';
  isFetching: boolean;
  derivedAmounts: { crypto: Money | null; quote: Money | null };
}

export function computeSecondaryAmountState({
  state,
  queryStatus,
  isFetching,
  derivedAmounts,
}: ComputeSecondaryAmountStateParams): SecondaryAmount {
  if (!state.baseSwapAsset) {
    return { status: 'idle', value: null };
  }

  if (queryStatus === 'pending') {
    return { status: 'pending', value: null };
  }

  const secondaryValue = whenInputCurrencyMode(state.inputCurrencyMode)({
    crypto: derivedAmounts.quote,
    quote: derivedAmounts.crypto,
  });

  if (queryStatus === 'error' || (queryStatus === 'success' && secondaryValue === null)) {
    return { status: 'error', value: null };
  }

  if (queryStatus === 'success' && secondaryValue !== null) {
    return { status: 'success', value: secondaryValue, isFetching };
  }

  return { status: 'idle', value: null };
}

export function createSwapAssetsSelector(
  assetSelectionType: 'base' | 'target',
  isAssetAllowed?: (asset: FungibleCryptoAsset) => boolean
) {
  return (data: AccountSwapAsset[]): AccountSwapAsset[] => {
    return pipe(
      data,
      filter(swapAsset => isRelevantSwapAsset(swapAsset, assetSelectionType, isAssetAllowed)),
      sortBy(
        getCurrencyPriority,
        swapAsset => -getAvailableQuoteBalance(swapAsset),
        swapAsset => swapAsset.asset.symbol
      )
    );
  };
}

function isRelevantSwapAsset(
  swapAsset: AccountSwapAsset,
  type: 'base' | 'target',
  isAssetAllowed?: (asset: FungibleCryptoAsset) => boolean
) {
  if (isAssetAllowed && !isAssetAllowed(swapAsset.asset)) {
    return false;
  }

  if (type === 'base') {
    return hasPositiveCryptoBalance(swapAsset) || isAllowedZeroBalanceAsset(swapAsset.asset);
  }

  return true;
}

function getCurrencyPriority(swapAsset: AccountSwapAsset): number {
  if (isBtcAsset(swapAsset.asset)) return 0;
  if (isStxAsset(swapAsset.asset)) return 1;
  if (isSip10Asset(swapAsset.asset) && swapAsset.asset.symbol === 'sBTC') return 2;
  return 3;
}

function getAvailableQuoteBalance(swapAsset: AccountSwapAsset): number {
  return swapAsset.balance?.quote.availableBalance.amount.toNumber() ?? 0;
}

function hasPositiveCryptoBalance(swapAsset: AccountSwapAsset): boolean {
  const cryptoBalance = swapAsset.balance?.crypto.availableBalance.amount.toNumber() ?? 0;
  return cryptoBalance > 0;
}

function isAllowedZeroBalanceAsset(asset: FungibleCryptoAsset) {
  return isBtcAsset(asset) || isStxAsset(asset);
}
