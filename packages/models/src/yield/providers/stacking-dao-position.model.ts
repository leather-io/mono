import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BasePooledStackingPosition, BaseYieldPosition } from '../yield-position.base.model';

interface BaseStackingDaoLstPosition extends BaseYieldPosition {
  provider: 'stacking-dao';
  withdrawalsBalance: Money;
  lstHolding?: StackingDaoLstHolding;
  withdrawals: StackingDaoLstWithdrawal[];
}

export interface StackingDaoStStxPosition extends BaseStackingDaoLstPosition {
  product: 'stackingdao-ststx';
}

export interface StackingDaoStStxBtcPosition extends BaseStackingDaoLstPosition {
  product: 'stackingdao-ststxbtc';
  sbtcReward?: StackingDaoReward;
}

export interface StackingDaoLstHolding {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceStx: Money;
  balanceQuote: Money;
  stxConversionRate: number;
  apy: number;
}

export interface StackingDaoReward {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceQuote: Money;
}

export interface StackingDaoLstWithdrawal {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceStx: Money;
  balanceQuote: Money;
  burnBlocksUntilUnlock: number;
  unlockBurnHeight: number;
}

export interface StackingDaoPooledStackingPosition extends BasePooledStackingPosition {
  provider: 'stacking-dao';
  product: 'stackingdao-pooled-stacking';
}
