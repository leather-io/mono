import { AccountAddresses } from '@leather.io/models';

/* 
  Services request DTO for requests made in an account context
*/
export interface AccountRequest {
  account: AccountAddresses;
  protections?: AccountRequestUtxoProtectionOptions;
  exclusions?: AccountRequestAddressExclusionOptions;
}

export interface AccountRequestUtxoProtectionOptions {
  /** Removes UTXO protections from inscriptions by satpoint (txid:vout:offset) */
  discardedInscriptions?: string[];
  /** Removes UTXO protection from all Runes */
  discardRunes?: boolean;
}

export interface AccountRequestAddressExclusionOptions {
  /** Skips native segwit (P2WPKH) addresses */
  nativeSegwitAddresses?: boolean;
  /** Skips taproot (P2TR) addresses */
  taprootAddresses?: boolean;
}
