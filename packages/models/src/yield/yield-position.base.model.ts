import type { Money } from '../money.model';
import type { YieldProductKey } from './yield-product.model';
import type { YieldProviderKey } from './yield-provider.model';

export interface BaseYieldPosition {
  readonly id: string;
  readonly provider: YieldProviderKey;
  readonly product: YieldProductKey;
  readonly totalBalance: Money;
  readonly apy: number;
}

export interface BasePooledStackingPosition extends BaseYieldPosition {
  readonly stackedBalanceStx: Money;
}
