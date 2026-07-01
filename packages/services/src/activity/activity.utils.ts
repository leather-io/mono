import type {
  BlockchainActivity,
  CryptoAssetId,
  FungibleCryptoAsset,
  MarketData,
} from '@leather.io/models';
import { baseCurrencyAmountInQuoteWithFallback, matchesAssetId } from '@leather.io/utils';

export function assetQuoteKey(asset: FungibleCryptoAsset): string {
  return 'assetId' in asset ? asset.assetId : asset.symbol;
}

export function applyMarketData(
  activities: BlockchainActivity[],
  marketDataByKey: Map<string, MarketData>
): BlockchainActivity[] {
  return activities.map(activity => ({
    ...activity,
    balanceChanges: activity.balanceChanges.map(change => {
      if (change.asset.category !== 'fungible') return change;
      const marketData = marketDataByKey.get(assetQuoteKey(change.asset));
      if (marketData === undefined) return change;
      return {
        ...change,
        amount: {
          ...change.amount,
          quote: baseCurrencyAmountInQuoteWithFallback(change.amount.crypto, marketData),
        },
      };
    }),
  }));
}

export function activityTouchesAsset(
  activity: BlockchainActivity,
  assetId: CryptoAssetId
): boolean {
  return activity.balanceChanges.some(change => matchesAssetId(change.asset, assetId));
}

export function sortActivityByTimestampDesc(a: { timestamp: number }, b: { timestamp: number }) {
  return b.timestamp - a.timestamp;
}
