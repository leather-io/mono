import BigNumber from 'bignumber.js';

/**
 * Time period options for price history queries
 */
export type PriceHistoryPeriod = '24h' | '7d' | '30d' | '90d' | '1y';

/**
 * Single price change data point
 */
export interface PriceChangePoint {
  timestamp: Date;
  price: BigNumber;
  changePercent: BigNumber;
}

/**
 * Comprehensive price change information for an asset
 */
export interface AssetPriceChange {
  current: BigNumber;
  change24h: BigNumber;
  changePercent24h: BigNumber;
  change7d?: BigNumber;
  changePercent7d?: BigNumber;
  change30d?: BigNumber;
  changePercent30d?: BigNumber;
}

/**
 * Historical price data for an asset over a specific period
 */
export interface AssetPriceHistory {
  period: PriceHistoryPeriod;
  dataPoints: PriceChangePoint[];
  summary: AssetPriceChange;
}

/**
 * Extended asset information combining metadata with market performance
 */
export interface AssetMarketInfo {
  symbol: string;
  name: string;
  description?: string;
  priceChange: AssetPriceChange;
  volume24h?: BigNumber;
  marketCap?: BigNumber;
}
