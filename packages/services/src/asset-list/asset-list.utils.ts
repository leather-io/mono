import type {
  CryptoAssetChain,
  FungibleCryptoAsset,
  FungibleCryptoAssetProtocol,
} from '@leather.io/models';
import { isMoneyGreaterThanZero } from '@leather.io/utils';

import type { AssetListItem, AssetListRequest, AssetListSortField } from './asset-list.types';

export function filterAssetsByProtocol(
  protocols: FungibleCryptoAssetProtocol[]
): (asset: FungibleCryptoAsset) => boolean {
  return asset => protocols.includes(asset.protocol);
}

export function filterAssetsByChain(
  chain: CryptoAssetChain
): (asset: FungibleCryptoAsset) => boolean {
  return asset => asset.chain === chain;
}

export function filterByMarketCap(minMarketCap: number): (item: AssetListItem) => boolean {
  return item => {
    const marketCap = item.marketStats?.marketCap;
    return marketCap !== undefined && marketCap >= minMarketCap;
  };
}

export function filterByTrustScore(minTrustScore: number): (item: AssetListItem) => boolean {
  return item => {
    const trustScore = item.analytics?.trustScore;
    return trustScore !== undefined && trustScore >= minTrustScore;
  };
}

export function filterByTrendingScore(minTrendingScore: number): (item: AssetListItem) => boolean {
  return item => {
    const trendingScore = item.analytics?.trendingScore;
    return trendingScore !== undefined && trendingScore >= minTrendingScore;
  };
}

export function filterByDistributionScore(
  minDistributionScore: number
): (item: AssetListItem) => boolean {
  return item => {
    const distributionScore = item.analytics?.distributionScore;
    return distributionScore !== undefined && distributionScore >= minDistributionScore;
  };
}

export function filterByHasBalance(item: AssetListItem): boolean {
  return item.balance ? isMoneyGreaterThanZero(item.balance.crypto.totalBalance) === true : false;
}

function getSortValue(item: AssetListItem, field: AssetListSortField): number | string {
  switch (field) {
    case 'name':
      return item.asset?.symbol ?? '';
    case 'marketCap':
      return item.marketStats?.marketCap ?? 0;
    case 'quoteTotalBalance':
      return Number(item.balance?.quote.totalBalance.amount ?? 0);
    case 'quoteAvailableBalance':
      return Number(item.balance?.quote.availableBalance.amount ?? 0);
    case 'change1d':
      return item.marketStats?.priceChange['1d'] ?? 0;
    case 'change1w':
      return item.marketStats?.priceChange['1w'] ?? 0;
    case 'change1m':
      return item.marketStats?.priceChange['1m'] ?? 0;
    case 'trustScore':
      return item.analytics?.trustScore ?? 0;
    case 'trendingScore':
      return item.analytics?.trendingScore ?? 0;
    case 'distributionScore':
      return item.analytics?.distributionScore ?? 0;
    case 'price':
      return Number(item.marketData?.price.amount ?? 0);
    case 'holderCount':
      return item.analytics?.holderCount ?? 0;
    default:
      return 0;
  }
}

function compareByField(a: AssetListItem, b: AssetListItem, field: AssetListSortField): number {
  const aVal = getSortValue(a, field);
  const bVal = getSortValue(b, field);
  if (typeof aVal === 'string' && typeof bVal === 'string') {
    return aVal.localeCompare(bVal);
  }
  return Number(aVal) - Number(bVal);
}

export function sortAssetListItems(
  items: AssetListItem[],
  sortFields: NonNullable<AssetListRequest['sort']>
): AssetListItem[] {
  return [...items].sort((a, b) => {
    for (const sort of sortFields) {
      const multiplier = sort.direction === 'asc' ? 1 : -1;
      const result = multiplier * compareByField(a, b, sort.field);
      if (result !== 0) return result;
    }
    return 0;
  });
}

export function paginateItems(
  items: AssetListItem[],
  pagination: NonNullable<AssetListRequest['pagination']>
): AssetListItem[] {
  return items.slice(pagination.offset, pagination.offset + pagination.limit);
}
