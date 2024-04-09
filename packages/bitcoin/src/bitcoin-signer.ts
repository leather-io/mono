import type { SignatureHash } from '@btckit/types';
import type { BitcoinNetworkModes } from '@leather-wallet/constants';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

export type AllowedSighashTypes = SignatureHash | btc.SignatureHash;

export interface Signer<Payment> {
  network: BitcoinNetworkModes;
  payment: Payment;
  keychain: HDKey;
  derivationPath: string;
  address: string;
  publicKey: Uint8Array;
  sign(tx: btc.Transaction): void;
  signIndex(tx: btc.Transaction, index: number, allowedSighash?: AllowedSighashTypes[]): void;
}
