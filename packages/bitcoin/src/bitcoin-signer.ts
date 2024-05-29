import type { BitcoinNetworkModes } from '@leather-wallet/models';
import { SignatureHash } from '@leather-wallet/rpc';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { SigHash } from '@scure/btc-signer/transaction';

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
