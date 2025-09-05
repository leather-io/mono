import { AccountAddresses } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

/* 
  Services request DTO for requests made in an account context
*/
export interface AccountRequest {
  account: AccountAddresses;
  protections?: AccountRequestUtxoProtectionOptions;
  exclusions?: AccountRequestAddressExclusionOptions;
  filters?: AccountRequestFilteringOptions;
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

export interface AccountRequestFilteringOptions {
  assetVisibility?: Record<SerializedCryptoAssetId, boolean>;
}
