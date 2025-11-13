import type { Money } from '../money.model';
import type { YieldProductKey } from './yield-product.model';
import type { YieldProviderKey } from './yield-provider.model';

export interface BaseYieldPosition {
  readonly provider: YieldProviderKey;
  readonly product: YieldProductKey;
  readonly totalBalance: Money;
  readonly netApy?: number;
  readonly updatedAtBlockHeight: number;
  readonly updatedAt: Date;
}
