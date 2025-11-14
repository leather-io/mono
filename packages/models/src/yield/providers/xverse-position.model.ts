import type { BasePooledStackingPosition } from '../yield-position.base.model';

export interface XversePooledStackingPosition extends BasePooledStackingPosition {
  provider: 'xverse';
  product: 'xverse-pooled-stacking';
}
