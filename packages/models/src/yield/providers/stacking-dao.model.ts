import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';
import type { YieldProductKeys } from '../yield-product.model';
import type { YieldProviderKeys } from '../yield-provider.model';

export interface StackingDaoLstPosition extends BaseYieldPosition {
  provider: typeof YieldProviderKeys.stackingDao;
  product: typeof YieldProductKeys.stackingDaoLst;
  totalBalance: Money;
  withdrawalsBalance: Money;
  ststx?: StackingDaoLstHolding;
  ststxbtc?: StackingDaoLstHolding;
  sbtcReward?: StackingDaoReward;
  withdrawals: StackingDaoLstWithdrawal[];
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

export interface StackingDaoPooledStackingPosition extends BaseYieldPosition {
  provider: typeof YieldProviderKeys.stackingDao;
  product: typeof YieldProductKeys.stackingDaoPooledStacking;
}
