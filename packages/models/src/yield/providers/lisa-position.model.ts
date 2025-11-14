import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';

export interface LisaLiStxPosition extends BaseYieldPosition {
  provider: 'lisa';
  product: 'lisa-listx';
  holding: LisaLstHolding;
}

export interface LisaLiquidStakingPosition extends BaseYieldPosition {
  provider: 'lisa';
  product: 'lisa-liquid-staking';
  holding: LisaLstHolding;
}

export interface LisaLstHolding {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceQuote: Money;
  apy: number;
}
