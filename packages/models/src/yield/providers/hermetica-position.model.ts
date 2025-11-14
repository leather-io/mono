import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';

export interface HermeticaUsdhStakingPosition extends BaseYieldPosition {
  provider: 'hermetica';
  product: 'hermetica-usdh-staking';
  staking: HermeticaStaking;
}

export interface HermeticaStaking {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceQuote: Money;
  apy: number;
  rewardAsset?: FungibleCryptoAsset;
  rewardBalance?: Money;
  rewardBalanceQuote?: Money;
}
