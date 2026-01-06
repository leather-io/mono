import { useCallback } from 'react';

import { HDKey, Versions } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { SigHash } from '@scure/btc-signer';

import {
  BitcoinAccount,
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

import { useBitcoinExtendedPublicKeyVersions } from './bitcoin-keychain';
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

interface BitcoinAddressIndexSignerFactoryArgs {
  accountIndex: number;
  accountKeychain: HDKey;
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): any;
  network: BitcoinNetworkModes;
  extendedPublicKeyVersions?: Versions;
}
export function bitcoinAddressIndexSignerFactory<T extends BitcoinAddressIndexSignerFactoryArgs>(
  args: T
) {
  const { accountIndex, network, paymentFn, accountKeychain, extendedPublicKeyVersions } = args;
  return ({
    changeIndex,
    addressIndex,
  }: {
    changeIndex: number;
    addressIndex: number;
  }): BitcoinSigner<ReturnType<T['paymentFn']>> => {
    const addressIndexKeychain = deriveAddressIndexKeychainFromAccount(accountKeychain)({
      changeIndex,
      addressIndex,
    });

    const payment = paymentFn(addressIndexKeychain, network);

    return makeBitcoinSigner({
      keychain: HDKey.fromExtendedKey(
        addressIndexKeychain.publicExtendedKey,
        extendedPublicKeyVersions
      ),
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
      signFn(tx: btc.Transaction) {
        if (!addressIndexKeychain.privateKey)
          throw new Error('Unable to sign transaction, no private key found');

        tx.sign(addressIndexKeychain.privateKey);
      },
      // TODO: Revisit allowedSighash type if/when fixed in btc-signer
      signAtIndexFn(tx: btc.Transaction, index: number, allowedSighash?: number[]) {
        if (!addressIndexKeychain.privateKey)
          throw new Error('Unable to sign transaction, no private key found');

        tx.signIdx(addressIndexKeychain.privateKey, index, allowedSighash);
      },
    });
  };
}

interface CreateSignersForAllNetworkTypesArgs {
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): unknown;
  mainnetKeychainFn(accountIndex: number): BitcoinAccount | undefined;
  testnetKeychainFn(accountIndex: number): BitcoinAccount | undefined;
  extendedPublicKeyVersions?: Versions;
}
function createSignersForAllNetworkTypes<T extends CreateSignersForAllNetworkTypesArgs>({
  mainnetKeychainFn,
  testnetKeychainFn,
  paymentFn,
  extendedPublicKeyVersions,
}: T) {
  return ({
    accountIndex,
    changeIndex,
    addressIndex,
  }: {
    accountIndex: number;
    changeIndex: number;
    addressIndex: number;
  }) => {
    const networkMap = new Map();

    function makeNetworkSigner(keychain: HDKey, network: BitcoinNetworkModes) {
      return bitcoinAddressIndexSignerFactory({
        accountIndex,
        accountKeychain: keychain,
        paymentFn: paymentFn as T['paymentFn'],
        network,
        extendedPublicKeyVersions,
      })({ changeIndex, addressIndex });
    }

    const mainnetAccount = mainnetKeychainFn(accountIndex);
    if (mainnetAccount) {
      networkMap.set('mainnet', makeNetworkSigner(mainnetAccount.keychain, 'mainnet'));
    }

    const testnetAccount = testnetKeychainFn(accountIndex);
    if (testnetAccount) {
      networkMap.set('testnet', makeNetworkSigner(testnetAccount.keychain, 'testnet'));
      networkMap.set('regtest', makeNetworkSigner(testnetAccount.keychain, 'regtest'));
      networkMap.set('signet', makeNetworkSigner(testnetAccount.keychain, 'signet'));
    }

    return Object.fromEntries(networkMap);
  };
}

export function useMakeBitcoinNetworkSignersForPaymentType<T>(
  mainnetKeychainFn: (index: number) => BitcoinAccount | undefined,
  testnetKeychainFn: (index: number) => BitcoinAccount | undefined,
  paymentFn: (keychain: HDKey, network: BitcoinNetworkModes) => T
) {
  const extendedPublicKeyVersions = useBitcoinExtendedPublicKeyVersions();

  return useCallback(
    (accountIndex: number) => {
      const zeroChangeIndex = 0;
      const zeroAddressIndex = 0;

      return createSignersForAllNetworkTypes({
        mainnetKeychainFn,
        testnetKeychainFn,
        paymentFn,
        extendedPublicKeyVersions,
      })({ accountIndex, changeIndex: zeroChangeIndex, addressIndex: zeroAddressIndex });
    },
    [extendedPublicKeyVersions, mainnetKeychainFn, paymentFn, testnetKeychainFn]
  );
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
