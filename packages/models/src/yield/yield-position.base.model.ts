import type { Money } from '../money.model';
import type { StacksProtocolId } from '../protocols/stacks-protocol.model';
import type { YieldProductKey } from './yield-product.model';

export interface BaseYieldPosition {
  readonly id: string;
  readonly provider: StacksProtocolId;
  readonly product: YieldProductKey;
  readonly totalBalance: Money;
  readonly apy: number;
}

export interface BasePooledStackingPosition extends BaseYieldPosition {
  readonly stackedBalanceStx: Money;
}
