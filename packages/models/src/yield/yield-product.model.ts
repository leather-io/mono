import type { Money } from '../money.model';
import { YieldProviderKey, YieldProviderKeys } from './yield-provider.model';

export const YieldProductKeys = {
  bitflowAmmLp: 'bitflow-amm-lp',
  zestBorrow: 'zest-borrow',
  graniteV1: 'granite-v1',
  stackingDaoLst: 'stackingdao-lst',
  stackingDaoPooledStacking: 'stackingdao-pooled-stacking',
  // fastPoolPooledStacking: 'fast-pool-pooled-stacking',
  // xversePooledStacking: 'xverse-pooled-stacking',
} as const;
export type YieldProductKey = (typeof YieldProductKeys)[keyof typeof YieldProductKeys];

export const YieldProductCategories = {
  AMM: 'amm',
  LENDING: 'lending',
  LST: 'lst',
  CDP: 'cdp',
  POOLED_STACKING: 'pooled-stacking',
  PERPS: 'perps',
} as const;
export type YieldProductCategory =
  (typeof YieldProductCategories)[keyof typeof YieldProductCategories];

export const YieldProductToProtocolMap = {
  [YieldProductKeys.bitflowAmmLp]: YieldProviderKeys.bitflow,
  [YieldProductKeys.zestBorrow]: YieldProviderKeys.zest,
  [YieldProductKeys.graniteV1]: YieldProviderKeys.granite,
  [YieldProductKeys.stackingDaoLst]: YieldProviderKeys.stackingDao,
  [YieldProductKeys.stackingDaoPooledStacking]: YieldProviderKeys.stackingDao,
  // [YieldProductKeys.fastPoolPooledStacking]: YieldProviderKeys.fastPool,
  // [YieldProductKeys.xversePooledStacking]: YieldProviderKeys.xverse,
} as const;

export interface YieldProduct {
  readonly key: YieldProductKey;
  readonly provider: YieldProviderKey;
  readonly name: string;
  readonly url: string;
  readonly category: YieldProductCategory;
  readonly tvl?: Money;
}
