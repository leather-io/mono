import type {
  BaseCryptoAssetBalance,
  CryptoAssetChain,
  FungibleCryptoAsset,
  FungibleCryptoAssetProtocol,
  MarketData,
  MarketStats,
  TokenAnalytics,
} from '@leather.io/models';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import type { AccountRequest } from '../types';

interface AssetListFilters {
  protocols?: FungibleCryptoAssetProtocol[];
  chain?: CryptoAssetChain;
  minMarketCap?: number;
  minTrustScore?: number;
  minTrendingScore?: number;
  minDistributionScore?: number;
  includeHidden?: boolean;
  hasBalance?: boolean;
}

interface AssetListIncludes {
  marketData?: boolean;
  marketStats?: boolean;
  analytics?: boolean;
  balance?: boolean;
}

export type AssetListSortField =
  | 'name'
  | 'marketCap'
  | 'quoteTotalBalance'
  | 'quoteAvailableBalance'
  | 'change1d'
  | 'change1w'
  | 'change1m'
  | 'trustScore'
  | 'trendingScore'
  | 'distributionScore'
  | 'price'
  | 'holderCount';

interface AssetListSort {
  field: AssetListSortField;
  direction: 'asc' | 'desc';
}

interface AssetListPagination {
  limit: number;
  offset: number;
}

export interface AssetListRequest {
  filters?: AssetListFilters;
  includes?: AssetListIncludes;
  sort?: AssetListSort[];
  pagination?: AssetListPagination;
  accountContext?: AccountRequest;
}

export interface AssetListItemBalance {
  crypto: BaseCryptoAssetBalance;
  quote: BaseCryptoAssetBalance;
}

export interface AssetListItem {
  id: SerializedCryptoAssetId;
  asset: FungibleCryptoAsset;
  marketData?: MarketData;
  marketStats?: MarketStats;
  analytics?: TokenAnalytics;
  balance?: AssetListItemBalance;
}

export interface AssetListMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface AssetListResponse {
  items: AssetListItem[];
  meta: AssetListMeta;
}
