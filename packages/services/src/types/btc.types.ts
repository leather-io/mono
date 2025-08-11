import { AccountAddresses } from '@leather.io/models';

export interface BtcAccountRequest {
  account: AccountAddresses;
  protections?: BtcAccountRequestUtxoProtectionOptions;
  exclusions?: BtcAccountRequestAddressExclusionOptions;
}

export interface BtcAccountRequestUtxoProtectionOptions {
  /** Removes UTXO protections from inscriptions by satpoint (txid:vout:offset) */
  discardedInscriptions?: string[];
  /** Removes UTXO protection from all Runes */
  discardRunes?: boolean;
}

export interface BtcAccountRequestAddressExclusionOptions {
  /** Skips native segwit (P2WPKH) addresses */
  nativeSegwitAddresses?: boolean;
  /** Skips taproot (P2TR) addresses */
  taprootAddresses?: boolean;
}
