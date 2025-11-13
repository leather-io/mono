import type { BitflowAmmLpPosition } from './providers/bitflow.model';
import type { GraniteV1Position } from './providers/granite.model';
import type {
  StackingDaoLstPosition,
  StackingDaoPooledStackingPosition,
} from './providers/stacking-dao.model';
import type { ZestBorrowPosition } from './providers/zest.model';

export type YieldPosition =
  | BitflowAmmLpPosition
  | ZestBorrowPosition
  | GraniteV1Position
  | StackingDaoLstPosition
  | StackingDaoPooledStackingPosition;
