import { filter, pipe, sortBy } from 'remeda';

import {
  SwappableFungibleCryptoAsset,
  isBtcAsset,
  isSip10Asset,
  isStxAsset,
} from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

export function createSwapAssetsSelector(assetSelectionType: 'base' | 'target') {
  return (data: AccountSwapAsset[]): AccountSwapAsset[] => {
    return pipe(
      data,
      filter(swapAsset => isRelevantSwapAsset(swapAsset, assetSelectionType)),
      sortBy(
        getCurrencyPriority,
        swapAsset => -getAvailableQuoteBalance(swapAsset),
        swapAsset => swapAsset.asset.symbol
      )
    );
  };
}

function isRelevantSwapAsset(swapAsset: AccountSwapAsset, type: 'base' | 'target') {
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

function isAllowedZeroBalanceAsset(asset: SwappableFungibleCryptoAsset) {
  return isBtcAsset(asset) || isStxAsset(asset);
}
