import { Money } from './money.model';

export interface BaseCryptoAssetBalance {
  /**
   * Balance as confirmed on chain
   */
  readonly totalBalance: Money;
  /**
   * Balance of pending receipt into account given pending transactions
   */
  readonly inboundBalance: Money;
  /**
   * Balance of pending delivery from account given pending transactions
   */
  readonly outboundBalance: Money;
  /**
   * totalBalance plus inboundBalance minus outboundBalance
   */
  readonly pendingBalance: Money;
  /**
   * totalBalance after filtering out outboundBalance, protectedBalance, and dustBalance
   */
  readonly availableBalance: Money;
}

export interface BtcBalance extends BaseCryptoAssetBalance {
  /**
   * Balance of UTXOs with collectibles
   */
  readonly protectedBalance: Money;
  /**
   * Balance across UTXOs with value less than dust threshold
   */
  readonly dustBalance: Money;
  /**
   * Balance of the union set of protected and dust UTXOs
   */
  readonly unspendableBalance: Money;
}

export interface StxBalance extends BaseCryptoAssetBalance {
  /**
   * availableBalance minus lockedBalance
   */
  readonly availableUnlockedBalance: Money;
  /**
   * total amount locked by contracts
   */
  readonly lockedBalance: Money;
  /**
   * totalBalance minus lockedBalance
   */
  readonly unlockedBalance: Money;
}

export type CryptoAssetBalance = BaseCryptoAssetBalance | BtcBalance | StxBalance;
