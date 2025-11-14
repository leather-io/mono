import type {
  BitflowAmmLpPosition,
  BitflowAmmStakingPosition,
} from './providers/bitflow-position.model';
import type { FastPoolPooledStackingPosition } from './providers/fast-pool-position.model';
import type {
  GraniteV1BorrowPosition,
  GraniteV1EarnPosition,
} from './providers/granite-position.model';
import type { HermeticaUsdhStakingPosition } from './providers/hermetica-position.model';
import type { LisaLiStxPosition, LisaLiquidStakingPosition } from './providers/lisa-position.model';
import type {
  StackingDaoPooledStackingPosition,
  StackingDaoStStxBtcPosition,
  StackingDaoStStxPosition,
} from './providers/stacking-dao-position.model';
import type { VelarAmmLpPosition, VelarFarmPosition } from './providers/velar-position.model';
import type { XversePooledStackingPosition } from './providers/xverse-position.model';
import type { ZestBorrowMarketPosition } from './providers/zest-position.model';

export type YieldPosition =
  | BitflowAmmLpPosition
  | BitflowAmmStakingPosition
  | ZestBorrowMarketPosition
  | GraniteV1EarnPosition
  | GraniteV1BorrowPosition
  | StackingDaoStStxPosition
  | StackingDaoStStxBtcPosition
  | StackingDaoPooledStackingPosition
  | VelarAmmLpPosition
  | VelarFarmPosition
  | LisaLiStxPosition
  | LisaLiquidStakingPosition
  | HermeticaUsdhStakingPosition
  | FastPoolPooledStackingPosition
  | XversePooledStackingPosition;
