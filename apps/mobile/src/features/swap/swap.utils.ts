import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';
import { BigNumber } from 'bignumber.js';

import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { createMoneyFromDecimal, sumMoney } from '@leather.io/utils';

export function getFungibleAssetDisplayName(asset: SwappableFungibleCryptoAsset) {
  if (asset.symbol === 'STX') return t`Stacks`;
  if (asset.symbol === 'BTC') return t`Bitcoin`;

  return asset.name;
}

// This exists to allow tracking and replacing decimal-related logic once we
// support locales with other decimal separators.
export const decimalSeparator = '.';

interface FormatSwapRateParams {
  swapRate: BigNumber;
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
}

export function formatSwapRate({ swapRate, baseAsset, targetAsset }: FormatSwapRateParams) {
  return `1 ${baseAsset.symbol} ≈ ${formatCurrency(createMoneyFromDecimal(swapRate, targetAsset.symbol, targetAsset.decimals))}`;
}

export function sumFeesInQuoteCurrency(networkFee: Money, providerFee?: Money): Money {
  return providerFee ? sumMoney([providerFee, networkFee]) : networkFee;
}
