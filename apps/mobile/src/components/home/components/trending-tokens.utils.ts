import { type MarketStats, type Sip10Asset, isSip10Asset } from '@leather.io/models';
import type { AssetListItem } from '@leather.io/services';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

export interface TrendingToken extends AssetListItem {
  readonly id: SerializedCryptoAssetId;
  readonly asset: Sip10Asset;
  readonly marketStats: MarketStats;
}

export function isTrendingToken(item: AssetListItem): item is TrendingToken {
  return (
    isSip10Asset(item.asset) &&
    !!item.marketStats &&
    typeof item.marketStats.priceChange['1d'] === 'number'
  );
}
