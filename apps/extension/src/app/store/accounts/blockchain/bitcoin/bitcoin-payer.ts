import { useCallback } from 'react';

import { HDKey, Versions } from '@scure/bip32';
import { SigHash } from '@scure/btc-signer';
import type { P2Ret, P2TROut } from '@scure/btc-signer/payment';

import {
  BitcoinNativeSegwitPayer,
  BitcoinPayer,
  BitcoinTaprootPayer,
  deriveAddressIndexKeychainFromAccount,
  isNativeSegwitDerivationPath,
  isTaprootDerivationPath,
} from '@leather.io/bitcoin';
import {
  appendAddressIndexToPath,
  extractAddressIndexFromPath,
  extractChangeIndexFromPath,
} from '@leather.io/crypto';
import type { BitcoinNetworkModes, OwnedUtxo } from '@leather.io/models';

import { useCurrentAccountNativeSegwitPayer } from './native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from './taproot-account.hooks';

// Conditional type to infer payment-specific Payer type
type PaymentToPayer<TPayment> = TPayment extends P2TROut
  ? BitcoinTaprootPayer
  : TPayment extends P2Ret
    ? BitcoinNativeSegwitPayer
    : BitcoinPayer;

type ExtractPaymentReturn<T> = T extends (keychain: HDKey, network: BitcoinNetworkModes) => infer R
  ? R
  : never;

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

type SupportedPaymentReturn = P2Ret | P2TROut;

interface MakeBitcoinPayerArgs {
  keychain: HDKey;
  network: BitcoinNetworkModes;
  keyOrigin: string;
  masterKeyFingerprint: string;
  paymentType: 'p2wpkh' | 'p2tr';
  paymentFn(keychain: HDKey, network: BitcoinNetworkModes): SupportedPaymentReturn;
}
function makeBitcoinPayer<T extends MakeBitcoinPayerArgs>(args: T) {
  const { keychain, network, paymentFn, keyOrigin, masterKeyFingerprint, paymentType } = args;
  const payment = paymentFn(keychain, network) as ReturnType<T['paymentFn']>;
  return {
    paymentType,
    network,
    payment,
    keyOrigin,
    masterKeyFingerprint,
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

interface BitcoinSoftwarePayerFactoryArgs<
  TPaymentFn extends (keychain: HDKey, network: BitcoinNetworkModes) => SupportedPaymentReturn,
> {
  accountKeychain: HDKey;
  accountKeyOrigin: string;
  masterKeyFingerprint: string;
  paymentFn: TPaymentFn;
  network: BitcoinNetworkModes;
  extendedPublicKeyVersions?: Versions;
}

export function bitcoinSoftwarePayerFactory<
  TPaymentFn extends (keychain: HDKey, network: BitcoinNetworkModes) => SupportedPaymentReturn,
>(
  args: BitcoinSoftwarePayerFactoryArgs<TPaymentFn>
): (args: {
  changeIndex: number;
  addressIndex: number;
}) => PaymentToPayer<ExtractPaymentReturn<TPaymentFn>> {
  const {
    network,
    paymentFn,
    accountKeychain,
    accountKeyOrigin,
    masterKeyFingerprint,
    extendedPublicKeyVersions,
  } = args;
  return ({ changeIndex, addressIndex }) => {
    const payerKeychain = deriveAddressIndexKeychainFromAccount(accountKeychain)({
      changeIndex,
      addressIndex,
    });

    const payment = paymentFn(payerKeychain, network);

    const paymentType = payment.type as 'p2wpkh' | 'p2tr';

    const payer = makeBitcoinPayer({
      keychain: HDKey.fromExtendedKey(payerKeychain.publicExtendedKey, extendedPublicKeyVersions),
      network,
      keyOrigin: appendAddressIndexToPath(accountKeyOrigin, changeIndex, addressIndex),
      masterKeyFingerprint,
      paymentType,
      paymentFn,
    });
    return payer as unknown as PaymentToPayer<ExtractPaymentReturn<TPaymentFn>>;
  };
}

export function useBitcoinPayerFromInput() {
  const createNativeSegwitSigner = useCurrentAccountNativeSegwitPayer();
  const createTaprootSigner = useCurrentAccountTaprootPayer();

  return useCallback(
    (input: OwnedUtxo): BitcoinPayer => {
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
