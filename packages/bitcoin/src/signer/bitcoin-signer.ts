import { HARDENED_OFFSET, HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { P2Ret, P2TROut } from '@scure/btc-signer/payment';
import { SigHash } from '@scure/btc-signer/transaction';
import * as bitcoin from 'bitcoinjs-lib';

import {
  DerivationPathDepth,
  appendAddressIndexToPath,
  decomposeDescriptor,
  deriveKeychainFromXpub,
  extractChangeIndexFromPath,
  keyOriginToDerivationPath,
} from '@leather.io/crypto';
import type { BitcoinAddress, BitcoinNetworkModes, ValueOf } from '@leather.io/models';
import { PaymentTypes, signatureHash } from '@leather.io/rpc';
import { hexToNumber, toHexString } from '@leather.io/utils';

import { getTaprootPaymentFromAddressIndex } from '../payments/p2tr-address-gen';
import { getNativeSegwitPaymentFromAddressIndex } from '../payments/p2wpkh-address-gen';
import {
  SupportedPaymentType,
  ecdsaPublicKeyToSchnorr,
  extractExtendedPublicKeyFromPolicy,
  inferPaymentTypeFromPath,
  whenSupportedPaymentType,
} from '../utils/bitcoin.utils';

export type AllowedSighashTypes = ValueOf<typeof signatureHash> | SigHash;

export interface BitcoinAccountKeychain {
  descriptor: string;
  masterKeyFingerprint: string;
  keyOrigin: string;
  keychain: HDKey;
  xpub: string;
}

export type WithDerivePayer<T, P> = T & { derivePayer: (args: BitcoinPayerInfo) => P };

export interface BitcoinSigner<Payment> {
  network: BitcoinNetworkModes;
  payment: Payment;
  keychain: HDKey;
  derivationPath: string;
  address: BitcoinAddress;
  publicKey: Uint8Array;
  sign(tx: btc.Transaction): void;
  signIndex(tx: btc.Transaction, index: number, allowedSighash?: AllowedSighashTypes[]): void;
}

export interface BitcoinPayerBase {
  paymentType: PaymentTypes;
  network: BitcoinNetworkModes;
  address: BitcoinAddress;
  keyOrigin: string;
  masterKeyFingerprint: string;
  publicKey: Uint8Array;
}

export interface BitcoinNativeSegwitPayer extends BitcoinPayerBase {
  paymentType: 'p2wpkh';
  payment: P2Ret;
}

export interface BitcoinTaprootPayer extends BitcoinPayerBase {
  paymentType: 'p2tr';
  payment: P2TROut;
}

export type BitcoinPayer = BitcoinNativeSegwitPayer | BitcoinTaprootPayer;

export function initializeBitcoinAccountKeychainFromDescriptor(
  descriptor: string
): BitcoinAccountKeychain {
  const { fingerprint, keyOrigin } = decomposeDescriptor(descriptor);
  return {
    descriptor,
    xpub: extractExtendedPublicKeyFromPolicy(descriptor),
    keyOrigin,
    masterKeyFingerprint: fingerprint,
    keychain: deriveKeychainFromXpub(extractExtendedPublicKeyFromPolicy(descriptor)),
  };
}

export interface BitcoinPayerInfo {
  change: number;
  addressIndex: number;
}
export function deriveBitcoinPayerFromAccount(descriptor: string, network: BitcoinNetworkModes) {
  const { fingerprint, keyOrigin } = decomposeDescriptor(descriptor);
  const accountKeychain = deriveKeychainFromXpub(extractExtendedPublicKeyFromPolicy(descriptor));
  const paymentType = inferPaymentTypeFromPath(keyOrigin) as SupportedPaymentType;

  if (accountKeychain.depth !== DerivationPathDepth.Account)
    throw new Error('Keychain passed is not an account');

  return ({ change, addressIndex }: BitcoinPayerInfo) => {
    const childKeychain = accountKeychain.deriveChild(change).deriveChild(addressIndex);

    const derivePayerFromAccount = whenSupportedPaymentType(paymentType)({
      p2tr: getTaprootPaymentFromAddressIndex,
      p2wpkh: getNativeSegwitPaymentFromAddressIndex,
    });

    const payment = derivePayerFromAccount(childKeychain, network);

    return {
      keyOrigin: appendAddressIndexToPath(keyOrigin, 0),
      masterKeyFingerprint: fingerprint,
      paymentType,
      network,
      payment,
      get address() {
        if (!payment.address) throw new Error('Payment address could not be derived');
        return payment.address;
      },
      get publicKey() {
        if (!childKeychain.publicKey) throw new Error('Public key could not be derived');
        return childKeychain.publicKey;
      },
    };
  };
}

interface BtcSignerDerivationPath {
  fingerprint: number;
  path: number[];
}
export type BtcSignerDefaultBip32Derivation = [Uint8Array, BtcSignerDerivationPath];
export type BtcSignerTapBip32Derivation = [
  Uint8Array,
  { hashes: Uint8Array[]; der: BtcSignerDerivationPath },
];

type BtcSignerBip32Derivation = BtcSignerDefaultBip32Derivation | BtcSignerTapBip32Derivation;

type PayerToBip32DerivationArgs = Pick<
  BitcoinPayer,
  'masterKeyFingerprint' | 'keyOrigin' | 'publicKey'
>;

/**
 * @example
 * ```ts
 * tx.addInput({
 *   ...input,
 *   bip32Derivation: [payerToBip32Derivation(payer)],
 * })
 * ```
 */
export function payerToBip32Derivation(
  args: PayerToBip32DerivationArgs
): BtcSignerDefaultBip32Derivation {
  return [
    args.publicKey,
    {
      fingerprint: hexToNumber(args.masterKeyFingerprint),
      path: btc.bip32Path(keyOriginToDerivationPath(args.keyOrigin)),
    },
  ];
}

/**
 * @example
 * ```ts
 * tx.addInput({
 *   ...input,
 *   tapBip32Derivation: [payerToTapBip32Derivation(payer)],
 * })
 * ```
 */
export function payerToTapBip32Derivation(
  args: PayerToBip32DerivationArgs
): BtcSignerTapBip32Derivation {
  return [
    // TODO: @kyranjamie to default to schnoor when TR so conversion isn't
    // necessary here?
    ecdsaPublicKeyToSchnorr(args.publicKey),
    {
      hashes: [],
      der: {
        fingerprint: hexToNumber(args.masterKeyFingerprint),
        path: btc.bip32Path(keyOriginToDerivationPath(args.keyOrigin)),
      },
    },
  ];
}

type PsbtInputBitcoinJsLib = bitcoin.Psbt['data']['inputs']['0'];

type TapBip32DerivationBitcoinJsLib = NonNullable<PsbtInputBitcoinJsLib['tapBip32Derivation']>['0'];

export function payerToTapBip32DerivationBitcoinJsLib(
  args: PayerToBip32DerivationArgs
): TapBip32DerivationBitcoinJsLib {
  return {
    masterFingerprint: Buffer.from(args.masterKeyFingerprint, 'hex'),
    path: keyOriginToDerivationPath(args.keyOrigin),
    leafHashes: [],
    pubkey: Buffer.from(ecdsaPublicKeyToSchnorr(args.publicKey)),
  };
}

type Bip32DerivationBitcoinJsLib = NonNullable<PsbtInputBitcoinJsLib['bip32Derivation']>['0'];

export function payerToBip32DerivationBitcoinJsLib(
  args: PayerToBip32DerivationArgs
): Bip32DerivationBitcoinJsLib {
  return {
    masterFingerprint: Buffer.from(args.masterKeyFingerprint, 'hex'),
    path: keyOriginToDerivationPath(args.keyOrigin),
    pubkey: Buffer.from(args.publicKey),
  };
}

export function extractPayerInfoFromDerivationPath(path: string) {
  return {
    change: extractChangeIndexFromPath(path),
    addressIndex: extractChangeIndexFromPath(path),
  };
}

/**
 * @description
 * Turns key format from @scure/btc-signer lib back into key origin string
 * @example
 * ```ts
 * const [inputOne] = getPsbtTxInputs(tx);
 * const keyOrigin = serializeKeyOrigin(inputOne.bip32Derivation[0][1]);
 * ```
 */
export function serializeKeyOrigin({ fingerprint, path }: BtcSignerDerivationPath) {
  const values = path.map(num => (num >= HARDENED_OFFSET ? num - HARDENED_OFFSET + "'" : num));
  return `${toHexString(fingerprint)}/${values.join('/')}`;
}

/**
 * @description
 * Of a given set of a `tx.input`s bip32 derivation paths from
 * `@scure/btc-signer`, serialize the paths back to the string format used
 * internally
 */
export function extractRequiredKeyOrigins(derivation: BtcSignerBip32Derivation[]) {
  return derivation.map(([_pubkey, path]) =>
    serializeKeyOrigin('hashes' in path ? path.der : path)
  );
}
