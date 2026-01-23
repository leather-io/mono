import { useCallback } from 'react';

import { HDKey, Versions } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { SigHash } from '@scure/btc-signer';

import {
  BitcoinSigner,
  deriveAddressIndexKeychainFromAccount,
  isNativeSegwitDerivationPath,
  isTaprootDerivationPath,
  makeNativeSegwitAddressIndexDerivationPath,
  makeTaprootAddressIndexDerivationPath,
  whenPaymentType,
} from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import type { BitcoinNetworkModes, OwnedUtxo } from '@leather.io/models';

import { useCurrentAccountNativeSegwitSigner } from './native-segwit-account.hooks';
import { useCurrentAccountTaprootSigner } from './taproot-account.hooks';

enum SignatureHash {
  DEFAULT = 0x00,
  ALL = 0x01,
  NONE = 0x02,
  SINGLE = 0x03,
  ALL_ANYONECANPAY = 0x81,
  NONE_ANYONECANPAY = 0x82,
  SINGLE_ANYONECANPAY = 0x83,
}
export const allSighashTypes = [
  SigHash.DEFAULT,
  SignatureHash.ALL,
  SignatureHash.NONE,
  SignatureHash.SINGLE,
  SigHash.ALL_ANYONECANPAY,
  SignatureHash.ALL_ANYONECANPAY,
  SignatureHash.NONE_ANYONECANPAY,
  SignatureHash.SINGLE_ANYONECANPAY,
];
type AllowedSighashTypes = SignatureHash | SigHash;

interface MakeBitcoinSignerArgs {
  keychain: HDKey;
  network: BitcoinNetworkModes;
  derivationPath: string;
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): any;
  signFn(tx: btc.Transaction): void;
  signAtIndexFn(tx: btc.Transaction, index: number, allowedSighash?: AllowedSighashTypes[]): void;
}
function makeBitcoinSigner<T extends MakeBitcoinSignerArgs>(args: T) {
  const { derivationPath, keychain, network, paymentFn, signFn, signAtIndexFn } = args;
  const payment = paymentFn(keychain, network) as ReturnType<T['paymentFn']>;
  return {
    network,
    payment,
    derivationPath,
    keychain,
    get address() {
      if (!payment.address) throw new Error('Unable to get address from payment');
      return payment.address;
    },
    get publicKey() {
      if (!keychain.publicKey) throw new Error('Unable to get publicKey from keychain');
      return keychain.publicKey;
    },
    sign: signFn as T['signFn'],
    signIndex: signAtIndexFn as T['signAtIndexFn'],
  };
}

interface BitcoinSigningCallbacks {
  signTransaction(tx: btc.Transaction): void;
  signTransactionAtIndex(tx: btc.Transaction, index: number, allowedSighash?: number[]): void;
}

interface BitcoinSoftwareSignerFactoryArgs {
  accountIndex: number;
  accountKeychain: HDKey;
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): any;
  network: BitcoinNetworkModes;
  extendedPublicKeyVersions?: Versions;
  getSigningCallbacks(args: { changeIndex: number; addressIndex: number }): BitcoinSigningCallbacks;
}
export function bitcoinSoftwareSignerFactory<T extends BitcoinSoftwareSignerFactoryArgs>(args: T) {
  const {
    accountIndex,
    network,
    paymentFn,
    accountKeychain,
    extendedPublicKeyVersions,
    getSigningCallbacks,
  } = args;
  return ({
    changeIndex,
    addressIndex,
  }: {
    changeIndex: number;
    addressIndex: number;
  }): BitcoinSigner<ReturnType<T['paymentFn']>> => {
    const signerKeychain = deriveAddressIndexKeychainFromAccount(accountKeychain)({
      changeIndex,
      addressIndex,
    });

    const payment = paymentFn(signerKeychain, network);
    const signingCallbacks = getSigningCallbacks({ changeIndex, addressIndex });

    return makeBitcoinSigner({
      keychain: HDKey.fromExtendedKey(signerKeychain.publicExtendedKey, extendedPublicKeyVersions),
      network,
      derivationPath: whenPaymentType(payment.type)({
        p2wpkh: makeNativeSegwitAddressIndexDerivationPath({
          network,
          accountIndex,
          changeIndex,
          addressIndex,
        }),
        p2tr: makeTaprootAddressIndexDerivationPath({
          network,
          accountIndex,
          changeIndex,
          addressIndex,
        }),
        'p2wpkh-p2sh': 'Not supported',
        p2pkh: 'Not supported',
        p2sh: 'Not supported',
      }),
      paymentFn,
      signFn: signingCallbacks.signTransaction,
      signAtIndexFn: signingCallbacks.signTransactionAtIndex,
    });
  };
}

export function useBitcoinSignerFromInput() {
  const createNativeSegwitSigner = useCurrentAccountNativeSegwitSigner();
  const createTaprootSigner = useCurrentAccountTaprootSigner();

  return useCallback(
    (input: OwnedUtxo): BitcoinSigner<any> => {
      const addressIndex = extractAddressIndexFromPath(input.path);
      const changeIndex = extractChangeIndexFromPath(input.path);

      if (isNativeSegwitDerivationPath(input.path)) {
        const nativeSegwitSigner = createNativeSegwitSigner?.({ changeIndex, addressIndex });
        if (nativeSegwitSigner) return nativeSegwitSigner;
      }

      if (isTaprootDerivationPath(input.path)) {
        const taprootSigner = createTaprootSigner?.({ changeIndex, addressIndex });
        if (taprootSigner) return taprootSigner;
      }

      throw new Error(`No signer found for input at path: ${input.path}`);
    },
    [createNativeSegwitSigner, createTaprootSigner]
  );
}
