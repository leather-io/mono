import { HDKey, Versions } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { SigHash } from '@scure/btc-signer/transaction';

import { DerivationPathDepth, Signer, addAddressIndexToPath } from '@leather.io/crypto';
import type { BitcoinNetworkModes } from '@leather.io/models';
import { SignatureHash } from '@leather.io/rpc';

import { deriveAddressIndexKeychainFromAccount } from './bitcoin.utils';

export type AllowedSighashTypes = SignatureHash | SigHash;

type BitcoinSignFn = (tx: btc.Transaction) => Promise<btc.Transaction>;

type SignIndexFn = (
  tx: btc.Transaction,
  index: number,
  allowedSighash?: AllowedSighashTypes[]
) => Promise<btc.Transaction>;

export interface BitcoinSigner<Payment> extends Signer {
  keychain: HDKey;
  network: BitcoinNetworkModes;
  payment: Payment;
  address: string;
  publicKey: Uint8Array;
  sign: BitcoinSignFn;
  signIndex: SignIndexFn;
}

/**
 * @deprecated Use Bitcoin signer factory
 * To remove after refactor
 */
export const makeBitcoinSigner = {};

interface BitcoinSignerFactoryArgs {
  path: string;
  network: BitcoinNetworkModes;
  accountKeychain: HDKey;
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): any;
  extendedPublicKeyVersions?: Versions;
}
export function bitcoinSignerFactory<T extends BitcoinSignerFactoryArgs>(args: T) {
  const { path, network, paymentFn, accountKeychain, extendedPublicKeyVersions } = args;

  if (accountKeychain.depth !== DerivationPathDepth.Account)
    throw new Error('Keychain must be of account depth');

  return (addressIndex: number): BitcoinSigner<T['paymentFn']> => {
    const addressIndexKeychain =
      deriveAddressIndexKeychainFromAccount(accountKeychain)(addressIndex);

    const payment = paymentFn(addressIndexKeychain, network);

    const keychain = HDKey.fromExtendedKey(
      addressIndexKeychain.publicExtendedKey,
      extendedPublicKeyVersions
    );

    return {
      keychain,
      network,
      derivationPath: addAddressIndexToPath(path, addressIndex),
      payment,
      // Errors are thrown as we expect the addresses to be available, and want
      // them typed as such
      get address() {
        if (!payment.address) throw new Error('Unable to get address from payment');
        return payment.address;
      },
      get publicKey() {
        if (!keychain.publicKey) throw new Error('Unable to get publicKey from keychain');
        return keychain.publicKey;
      },
      async sign(unsignedTx: btc.Transaction) {
        if (!addressIndexKeychain.privateKey)
          throw new Error('Unable to sign transaction, no private key found');

        const tx = unsignedTx.clone();
        tx.sign(addressIndexKeychain.privateKey);
        return tx;
      },
      async signIndex(unsignedTx: btc.Transaction, index: number, allowedSighash?: number[]) {
        if (!addressIndexKeychain.privateKey)
          throw new Error('Unable to sign transaction, no private key found');

        const tx = unsignedTx.clone();
        tx.signIdx(addressIndexKeychain.privateKey, index, allowedSighash);
        return tx;
      },
    };
  };
}
