import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { SigHash } from '@scure/btc-signer/transaction';

import type { BitcoinNetworkModes } from '@leather.io/models';
import { SignatureHash } from '@leather.io/rpc';

export type AllowedSighashTypes = SignatureHash | SigHash;

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
