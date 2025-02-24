import { Money } from '../money.model';

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

  /**
   * Balance of the union set of protected and uneconomical UTXOs
   */
  readonly unspendableBalance: Money;
}

export interface StxCryptoAssetBalance extends BaseCryptoAssetBalance {
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

export type CryptoAssetBalance =
  | BaseCryptoAssetBalance
  | BtcCryptoAssetBalance
  | StxCryptoAssetBalance;
