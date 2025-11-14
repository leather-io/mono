import { YieldProviderKey, YieldProviderKeys } from './yield-provider.model';

export const YieldProductKeys = {
  bitflowAmmLp: 'bitflow-amm-lp',
  bitflowAmmStaking: 'bitflow-amm-staking',
  zestBorrowMarket: 'zest-borrow-market',
  graniteV1Earn: 'granite-v1-earn',
  graniteV1Borrow: 'granite-v1-borrow',
  stackingDaoStstx: 'stackingdao-ststx',
  stackingDaoStstxbtc: 'stackingdao-ststxbtc',
  stackingDaoPooledStacking: 'stackingdao-pooled-stacking',
  lisaListx: 'lisa-listx',
  lisaLiquidStaking: 'lisa-liquid-staking',
  hermeticaUsdhStaking: 'hermetica-usdh-staking',
  velarAmmLp: 'velar-amm-lp',
  velarPerps: 'velar-perps',
  velarAmmLpFarming: 'velar-amm-lp-farming',
  fastPoolPooledStacking: 'fast-pool-pooled-stacking',
  xversePooledStacking: 'xverse-pooled-stacking',
} as const;
export type YieldProductKey = (typeof YieldProductKeys)[keyof typeof YieldProductKeys];

export const YieldProductCategories = {
  AMM: 'amm',
  LENDING: 'lending',
  LIQUID_STACKING: 'liquid-stacking',
  POOLED_STACKING: 'pooled-stacking',
  STAKING: 'staking',
  PERPS: 'perps',
} as const;
export type YieldProductCategory =
  (typeof YieldProductCategories)[keyof typeof YieldProductCategories];

export const YieldProductToProviderMap = {
  [YieldProductKeys.bitflowAmmLp]: YieldProviderKeys.bitflow,
  [YieldProductKeys.bitflowAmmStaking]: YieldProviderKeys.bitflow,
  [YieldProductKeys.zestBorrowMarket]: YieldProviderKeys.zest,
  [YieldProductKeys.graniteV1Earn]: YieldProviderKeys.granite,
  [YieldProductKeys.graniteV1Borrow]: YieldProviderKeys.granite,
  [YieldProductKeys.stackingDaoStstx]: YieldProviderKeys.stackingDao,
  [YieldProductKeys.stackingDaoStstxbtc]: YieldProviderKeys.stackingDao,
  [YieldProductKeys.stackingDaoPooledStacking]: YieldProviderKeys.stackingDao,
  [YieldProductKeys.lisaListx]: YieldProviderKeys.lisa,
  [YieldProductKeys.lisaLiquidStaking]: YieldProviderKeys.lisa,
  [YieldProductKeys.hermeticaUsdhStaking]: YieldProviderKeys.hermetica,
  [YieldProductKeys.velarAmmLp]: YieldProviderKeys.velar,
  [YieldProductKeys.velarPerps]: YieldProviderKeys.velar,
  [YieldProductKeys.velarAmmLpFarming]: YieldProviderKeys.velar,
  [YieldProductKeys.fastPoolPooledStacking]: YieldProviderKeys.fastPool,
  [YieldProductKeys.xversePooledStacking]: YieldProviderKeys.xverse,
} as const;

export type YieldProduct = BaseYieldProduct | PooledStackingYieldProduct;

export interface BaseYieldProduct {
  readonly key: YieldProductKey;
  readonly provider: YieldProviderKey;
  readonly category: YieldProductCategory;
  readonly name: string;
  readonly url: string;
}

// normalizes pooled stacking product data
export interface PooledStackingYieldProduct extends BaseYieldProduct {
  readonly category: 'pooled-stacking';
  readonly stackerCount: number;
}
