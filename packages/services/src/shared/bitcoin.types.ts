import { UtxoId } from '@leather.io/models';

export interface BitcoinAccountIdentifier {
  fingerprint: string;
  accountIndex: number;
  taprootDescriptor: string;
  nativeSegwitDescriptor: string;
}

export interface BitcoinAccountServiceRequest {
  account: BitcoinAccountIdentifier;
  unprotectedUtxos: UtxoId[];
}
