export interface TokenHolderSegment {
  readonly holderCount: number;
  readonly balance: number;
  readonly contracts: { readonly count: number; readonly balance: number };
  readonly multisigs: { readonly count: number; readonly balance: number };
  readonly standard: { readonly count: number; readonly balance: number };
}

export interface TokenAnalytics {
  readonly circulatingSupply: number;
  readonly holderCount?: number;
  readonly distributionScore?: number;
  readonly trustScore?: number;
  readonly trendingScore?: number;
  readonly updatedAt: string;
}

export const topHolderKeys = [1, 10, 50, 100, 200] as const;
export const percentileKeys = [10, 25, 50, 75] as const;

export type TokenTopHolderKey = (typeof topHolderKeys)[number];
export type TokenDistributionPercentileKey = (typeof percentileKeys)[number];

export interface TokenDistribution {
  readonly topHolders: Partial<Record<TokenTopHolderKey, TokenHolderSegment>>;
  readonly percentiles: Partial<Record<TokenDistributionPercentileKey, TokenHolderSegment>>;
  readonly updatedAt: string;
}
