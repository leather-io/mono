import { AccountAddresses, UtxoId } from '@leather.io/models';

export interface BtcAccountRequest {
  account: AccountAddresses;
  unprotectedUtxos: UtxoId[];
  exclude?: {
    nativeSegwitAddresses?: boolean;
    taprootAddresses?: boolean;
  };
}
