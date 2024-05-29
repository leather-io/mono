import { Money } from '../money.model';

export interface BaseCryptoAssetBalance {
  /**
   * totalBalance after filtering out outboundBalance, protectedBalance, and uneconomicalBalance
   */
  readonly availableBalance: Money;
}

export interface BtcCryptoAssetBalance extends BaseCryptoAssetBalance {
  /**
   * Balance of UTXOs with collectibles
   */
  readonly protectedBalance: Money;
  /**
   * Balance across UTXOs with need for larger fee than principal by UTXO given standard rate
   */
  readonly uneconomicalBalance: Money;
}

export interface StxCryptoAssetBalance extends BaseCryptoAssetBalance {
  /**
   * availableBalance minus lockedBalance
   */
  readonly availableUnlockedBalance: Money;
  /**
   * Balance of pending receipt into account given pending transactions
   */
  readonly inboundBalance: Money;
  /**
   * totalBalance minus total amount locked by contracts
   */
  readonly lockedBalance: Money;
  /**
   * Balance of pending delivery from account given pending transactions
   */
  readonly outboundBalance: Money;
  /**
   * totalBalance plus inboundBalance minus outboundBalance
   */
  readonly pendingBalance: Money;
  /**
   * Balance as confirmed on chain
   */
  readonly totalBalance: Money;
  /**
   * totalBalance minus lockedBalance
   */
  readonly unlockedBalance: Money;
}

export type CryptoAssetBalance =
  | BaseCryptoAssetBalance
  | BtcCryptoAssetBalance
  | StxCryptoAssetBalance;

export function createCryptoAssetBalance(balance: Money): BaseCryptoAssetBalance {
  return { availableBalance: balance };
}
