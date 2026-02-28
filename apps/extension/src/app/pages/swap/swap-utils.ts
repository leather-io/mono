import BigNumber from 'bignumber.js';

import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { createMoneyFromDecimal, sumMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

export function getFungibleAssetDisplayName(asset: SwappableFungibleCryptoAsset): string {
  if (asset.symbol === 'STX') return 'Stacks';
  if (asset.symbol === 'BTC') return 'Bitcoin';
  return asset.name;
}

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
