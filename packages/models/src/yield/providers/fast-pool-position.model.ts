import type { BasePooledStackingPosition } from '../yield-position.base.model';

export interface FastPoolPooledStackingPosition extends BasePooledStackingPosition {
  provider: 'fast-pool';
  product: 'fast-pool-pooled-stacking';
}
