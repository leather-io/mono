import { filter, map, pipe, sortBy } from 'remeda';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  type CryptoAssetProtocol,
  type SwappableFungibleCryptoAsset,
  isBtcAsset,
  isNativeAsset,
  isStxAsset,
} from '@leather.io/models';
import { type AccountSwapAsset } from '@leather.io/services';

interface PriorityAssetConfig {
  protocol: CryptoAssetProtocol;
  priority: number;
}

const assetOrderPriority: Record<string, PriorityAssetConfig> = {
  BTC: { protocol: 'nativeBtc', priority: 0 },
  STX: { protocol: 'nativeStx', priority: 1 },
  sBTC: { protocol: 'sip10', priority: 2 },
  USDCx: { protocol: 'sip10', priority: 3 },
  USDh: { protocol: 'sip10', priority: 4 },
  stSTX: { protocol: 'sip10', priority: 4 },
  aeUSDC: { protocol: 'sip10', priority: 4 },
  ALEX: { protocol: 'sip10', priority: 5 },
  LiSTX: { protocol: 'sip10', priority: 5 },
  WELSH: { protocol: 'sip10', priority: 5 },
  DIKO: { protocol: 'sip10', priority: 5 },
  MIA: { protocol: 'sip10', priority: 6 },
};

const defaultPriority = 100;

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
  const config = assetOrderPriority[swapAsset.asset.symbol];
  if (config && swapAsset.asset.protocol === config.protocol) {
    return config.priority;
  }
  return defaultPriority;
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

export function resolveNetworkFeeAsset(asset?: SwappableFungibleCryptoAsset) {
  if (!asset) return;
  if (isNativeAsset(asset)) return asset;
  return {
    stacks: stxAsset,
    bitcoin: btcAsset,
  }[asset.chain];
}
