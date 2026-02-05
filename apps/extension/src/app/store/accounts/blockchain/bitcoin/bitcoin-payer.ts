import { useCallback } from 'react';

import { HDKey, Versions } from '@scure/bip32';
import { SigHash } from '@scure/btc-signer';
import type { P2Ret, P2TROut } from '@scure/btc-signer/payment';

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

import { useCurrentAccountNativeSegwitPayer } from './native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from './taproot-account.hooks';

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

interface MakeBitcoinPayerArgs {
  keychain: HDKey;
  network: BitcoinNetworkModes;
  derivationPath: string;
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): any;
}
function makeBitcoinPayer<T extends MakeBitcoinPayerArgs>(args: T) {
  const { derivationPath, keychain, network, paymentFn } = args;
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
  };
}

interface BitcoinSoftwarePayerFactoryArgs {
  accountIndex: number;
  accountKeychain: HDKey;
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): any;
  network: BitcoinNetworkModes;
  extendedPublicKeyVersions?: Versions;
}
export function bitcoinSoftwarePayerFactory<T extends BitcoinSoftwarePayerFactoryArgs>(args: T) {
  const { accountIndex, network, paymentFn, accountKeychain, extendedPublicKeyVersions } = args;
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

    return makeBitcoinPayer({
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
    });
  };
}

export function useBitcoinPayerFromInput() {
  const createNativeSegwitSigner = useCurrentAccountNativeSegwitPayer();
  const createTaprootSigner = useCurrentAccountTaprootPayer();

  return useCallback(
    (input: OwnedUtxo): BitcoinSigner<P2TROut | P2Ret> => {
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
