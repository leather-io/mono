import { chunk, filter, isDefined, map, pipe, take } from 'remeda';

import { type MarketStats, type Sip10Asset, isSip10Asset } from '@leather.io/models';
import type { AssetListItem } from '@leather.io/services';
import { type SerializedCryptoAssetId, toColumnMajorRows } from '@leather.io/utils';

export interface TrendingToken extends AssetListItem {
  readonly id: SerializedCryptoAssetId;
  readonly asset: Sip10Asset;
  readonly marketStats: MarketStats;
}

function toTrendingToken(item: AssetListItem): TrendingToken | undefined {
  const { asset, marketStats } = item;
  if (!isSip10Asset(asset) || !marketStats || typeof marketStats.priceChange['1d'] !== 'number') {
    return undefined;
  }
  return { ...item, asset, marketStats };
}

export function isTrendingToken(item: AssetListItem) {
  return toTrendingToken(item) !== undefined;
}

export function prepTrendingItems(items: AssetListItem[]) {
  const numRows = 3;
  const filtered = pipe(items, map(toTrendingToken), filter(isDefined), take(15));
  if (filtered.length === 0) return [];
  const rowSize = Math.ceil(filtered.length / numRows);
  return pipe(filtered, toColumnMajorRows(rowSize), chunk(rowSize));
}
