import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';

export interface BitflowAmmLpPosition extends BaseYieldPosition {
  provider: 'bitflow';
  product: 'bitflow-amm-lp';
  poolSharePercentage: number;
  lpToken: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
  tokenX: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
  tokenY: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
}

export interface BitflowAmmStakingPosition extends BaseYieldPosition {
  provider: 'bitflow';
  product: 'bitflow-amm-staking';
  stakedLpToken: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
  rewardToken?: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
}
