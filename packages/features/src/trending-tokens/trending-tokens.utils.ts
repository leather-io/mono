import { chunk, filter, pipe, take } from 'remeda';

import { type MarketStats, type Sip10Asset, isSip10Asset } from '@leather.io/models';
import type { AssetListItem } from '@leather.io/services';
import { type SerializedCryptoAssetId, toColumnMajorRows } from '@leather.io/utils';

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

export function prepTrendingItems(items: AssetListItem[]) {
  const numRows = 3;
  const filtered = pipe(items, filter(isTrendingToken), take(15));
  if (filtered.length === 0) return [];
  const rowSize = Math.ceil(filtered.length / numRows);
  return pipe(filtered, toColumnMajorRows(rowSize), chunk(rowSize));
}
