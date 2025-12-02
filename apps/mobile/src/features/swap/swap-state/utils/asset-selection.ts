import { filter, map, pipe, sortBy } from 'remeda';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  SwappableFungibleCryptoAsset,
  isBtcAsset,
  isNativeAsset,
  isSip10Asset,
  isStxAsset,
} from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

export function createSwapAssetsSelector(assetSelectionType: 'base' | 'target') {
  return (data: AccountSwapAsset[]): AccountSwapAsset[] => {
    return pipe(
      data,
      map(mapUnlockedToAvailableBalance),
      filter(swapAsset => isRelevantSwapAsset(swapAsset, assetSelectionType)),
      sortBy(
        getCurrencyPriority,
        swapAsset => -getAvailableQuoteBalance(swapAsset),
        swapAsset => swapAsset.asset.symbol
      )
    );
  };
}

// TODO: Temporary workaround - maps availableUnlockedBalance to availableBalance for STX
function mapUnlockedToAvailableBalance(swapAsset: AccountSwapAsset): AccountSwapAsset {
  if (!swapAsset.balance) return swapAsset;

  return {
    ...swapAsset,
    balance: {
      crypto:
        'availableUnlockedBalance' in swapAsset.balance.crypto
          ? {
              ...swapAsset.balance.crypto,
              availableBalance: swapAsset.balance.crypto.availableUnlockedBalance,
            }
          : swapAsset.balance.crypto,
      quote:
        'availableUnlockedBalance' in swapAsset.balance.quote
          ? {
              ...swapAsset.balance.quote,
              availableBalance: swapAsset.balance.quote.availableUnlockedBalance,
            }
          : swapAsset.balance.quote,
    },
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

export function resolveNetworkFeeAsset(
  baseAsset?: SwappableFungibleCryptoAsset,
  targetAsset?: SwappableFungibleCryptoAsset
) {
  if (!baseAsset) return;

  if (isNativeAsset(baseAsset)) return baseAsset;

  if (baseAsset.symbol === 'sBTC' && targetAsset?.symbol === 'BTC') {
    return targetAsset;
  }

  return {
    stacks: stxAsset,
    bitcoin: btcAsset,
  }[baseAsset.chain];
}
