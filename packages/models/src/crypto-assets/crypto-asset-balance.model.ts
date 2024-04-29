import { Money } from '../money.model';

/** Balance types:
 * availableBalance: totalBalance after filtering out outboundBalance, protectedBalance, and uneconomicalBalance
 * availableUnlockedBalance; availableBalance minus lockedBalance
 * inboundBalance - balance of pending receipt into account given pending transactions
 * lockedBalance - totalBalance minus total amount locked by contracts
 * outboundBalance - balance of pending delivery from account given pending transactions
 * pendingBalance - totalBalance plus inboundBalance minus outboundBalance
 * protectedBalance - balance of UTXOs with collectibles (if bitcoin)
 * totalBalance - balance as confirmed on chain
 * uneconomicalBalance - balance across UTXOs with need for larger fee than principal by UTXO given standard rate (if bitcoin)
 * unlockedBalance - totalBalance minus lockedBalance
 */

export interface CryptoAssetBalance {
  readonly availableBalance: Money;
}

export interface BtcCryptoAssetBalance extends CryptoAssetBalance {
  readonly protectedBalance: Money;
  readonly uneconomicalBalance: Money;
}

export interface StxCryptoAssetBalance extends CryptoAssetBalance {
  readonly availableUnlockedBalance: Money;
  readonly inboundBalance: Money;
  readonly lockedBalance: Money;
  readonly outboundBalance: Money;
  readonly pendingBalance: Money;
  readonly totalBalance: Money;
  readonly unlockedBalance: Money;
}

export type CryptoAssetBalances =
  | CryptoAssetBalance
  | BtcCryptoAssetBalance
  | StxCryptoAssetBalance;
