import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';

export interface VelarAmmLpPosition extends BaseYieldPosition {
  provider: 'velar';
  product: 'velar-amm-lp';
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

export interface VelarFarmPosition extends BaseYieldPosition {
  provider: 'velar';
  product: 'velar-amm-lp-farming';
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
