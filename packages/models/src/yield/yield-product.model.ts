import { StacksProtocolId, StacksProtocolIds } from '../protocols/stacks-protocol.model';

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
  [YieldProductKeys.bitflowAmmLp]: StacksProtocolIds.bitflow,
  [YieldProductKeys.bitflowAmmStaking]: StacksProtocolIds.bitflow,
  [YieldProductKeys.zestBorrowMarket]: StacksProtocolIds.zest,
  [YieldProductKeys.graniteV1Earn]: StacksProtocolIds.granite,
  [YieldProductKeys.graniteV1Borrow]: StacksProtocolIds.granite,
  [YieldProductKeys.stackingDaoStstx]: StacksProtocolIds.stackingDao,
  [YieldProductKeys.stackingDaoStstxbtc]: StacksProtocolIds.stackingDao,
  [YieldProductKeys.stackingDaoPooledStacking]: StacksProtocolIds.stackingDao,
  [YieldProductKeys.lisaListx]: StacksProtocolIds.alex,
  [YieldProductKeys.lisaLiquidStaking]: StacksProtocolIds.alex,
  [YieldProductKeys.hermeticaUsdhStaking]: StacksProtocolIds.hermetica,
  [YieldProductKeys.velarAmmLp]: StacksProtocolIds.velar,
  [YieldProductKeys.velarPerps]: StacksProtocolIds.velar,
  [YieldProductKeys.velarAmmLpFarming]: StacksProtocolIds.velar,
  [YieldProductKeys.fastPoolPooledStacking]: StacksProtocolIds.fastPool,
  [YieldProductKeys.xversePooledStacking]: StacksProtocolIds.xverse,
} as const;

export type YieldProduct = BaseYieldProduct | PooledStackingYieldProduct;

export interface BaseYieldProduct {
  readonly key: YieldProductKey;
  readonly provider: StacksProtocolId;
  readonly category: YieldProductCategory;
  readonly name: string;
  readonly url: string;
}

// normalizes pooled stacking product data
export interface PooledStackingYieldProduct extends BaseYieldProduct {
  readonly category: 'pooled-stacking';
  readonly stackerCount: number;
}
