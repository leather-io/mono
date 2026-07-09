import { hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import * as btc from '@scure/btc-signer';
import { TransactionInput, TransactionOutput } from '@scure/btc-signer/psbt';
import type { BitcoinPayer, BitcoinTaprootPayer } from 'signer/bitcoin-payer';

import { HD_KEY_VERSIONS_BY_NETWORK } from '@leather.io/constants';
import {
  DerivationPathDepth,
  deriveKeychainFromXpub,
  extractPurposeFromPath,
} from '@leather.io/crypto';
import { BitcoinAddress, BitcoinNetworkModes, NetworkModes } from '@leather.io/models';
import type { BitcoinPaymentTypes } from '@leather.io/rpc';
import { isDefined, whenNetwork } from '@leather.io/utils';

import { getTaprootPayment } from '../payments/p2tr-address-gen';
import { getNativeSegwitPaymentFromAddressIndex } from '../payments/p2wpkh-address-gen';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import { BtcSignerNetwork, getBtcSignerLibNetworkConfigByMode } from './bitcoin.network';

export interface BitcoinAccount {
  type: BitcoinPaymentTypes;
  derivationPath: string;
  keychain: HDKey;
  accountIndex: number;
  network: BitcoinNetworkModes;
}

/**
 * Represents a map of `BitcoinNetworkModes` to `NetworkModes`. While Bitcoin
 * has a number of networks, its often only necessary to consider the higher
 * level concept of mainnet and testnet
 */
export const bitcoinNetworkToCoreNetworkMap: Record<BitcoinNetworkModes, NetworkModes> = {
  mainnet: 'mainnet',
  testnet: 'testnet',
  regtest: 'testnet',
  signet: 'testnet',
};
export function bitcoinNetworkModeToCoreNetworkMode(mode: BitcoinNetworkModes) {
  return bitcoinNetworkToCoreNetworkMap[mode];
}

type BitcoinNetworkMap<T> = Record<BitcoinNetworkModes, T>;

export function whenBitcoinNetwork(mode: BitcoinNetworkModes) {
  return <T extends BitcoinNetworkMap<unknown>>(networkMap: T) =>
    networkMap[mode] as T[BitcoinNetworkModes];
}

/**
 * Map representing the "Coin Type" section of a derivation path.
 * Consider example below, Coin type is one, thus testnet
 * @example
 * `m/86'/1'/0'/0/0`
 */
export const coinTypeMap: Record<NetworkModes, 0 | 1> = {
  mainnet: 0,
  testnet: 1,
};

export function getBitcoinCoinTypeIndexByNetwork(network: BitcoinNetworkModes) {
  return coinTypeMap[bitcoinNetworkModeToCoreNetworkMode(network)];
}

export function deriveAddressIndexKeychainFromAccount(keychain: HDKey) {
  if (keychain.depth !== DerivationPathDepth.Account)
    throw new Error('Keychain passed is not an account');

  return ({ changeIndex, addressIndex }: { changeIndex: number; addressIndex: number }) =>
    keychain.deriveChild(changeIndex).deriveChild(addressIndex);
}

export function deriveAddressIndexZeroFromAccount(keychain: HDKey) {
  return deriveAddressIndexKeychainFromAccount(keychain)({
    changeIndex: 0,
    addressIndex: 0,
  });
}

export const ecdsaPublicKeyLength = 33;

export function ecdsaPublicKeyToSchnorr(pubKey: Uint8Array) {
  if (pubKey.byteLength !== ecdsaPublicKeyLength) throw new Error('Invalid public key length');
  return pubKey.slice(1);
}

// Basically same as above, to remove
export function toXOnly(pubKey: Buffer) {
  return pubKey.length === 32 ? pubKey : pubKey.subarray(1, 33);
}

export function decodeBitcoinTx(tx: string): ReturnType<typeof btc.RawTx.decode> {
  return btc.RawTx.decode(hexToBytes(tx));
}

export function getAddressFromOutScript(
  script: Uint8Array,
  bitcoinNetwork: BtcSignerNetwork
): BitcoinAddress | null {
  const outputScript = btc.OutScript.decode(script);

  switch (outputScript.type) {
    case 'pkh':
    case 'sh':
    case 'wpkh':
    case 'wsh':
      return createBitcoinAddress(
        btc.Address(bitcoinNetwork).encode({
          type: outputScript.type,
          hash: outputScript.hash,
        })
      );
    case 'tr':
      return createBitcoinAddress(
        btc.Address(bitcoinNetwork).encode({
          type: outputScript.type,
          pubkey: outputScript.pubkey,
        })
      );
    case 'ms':
      return createBitcoinAddress(btc.p2ms(outputScript.m, outputScript.pubkeys).address ?? '');
    case 'pk':
      return createBitcoinAddress(btc.p2pk(outputScript.pubkey, bitcoinNetwork).address ?? '');
    case 'unknown':
    case 'tr_ms':
    case 'tr_ns':
    case 'p2a':
    default:
      return null;
  }
}

export function getOutputScriptType(script: Uint8Array) {
  return btc.OutScript.decode(script).type;
}
/**
 * Payment type identifiers, as described by `@scure/btc-signer` library
 */
export type BtcSignerLibPaymentTypeIdentifers = 'wpkh' | 'wsh' | 'tr' | 'pkh' | 'sh';

export const paymentTypeMap: Record<BtcSignerLibPaymentTypeIdentifers, BitcoinPaymentTypes> = {
  wpkh: 'p2wpkh',
  wsh: 'p2wpkh-p2sh',
  tr: 'p2tr',
  pkh: 'p2pkh',
  sh: 'p2sh',
};

export function btcSignerLibPaymentTypeToPaymentTypeMap(
  payment: BtcSignerLibPaymentTypeIdentifers
) {
  return paymentTypeMap[payment];
}

export function isBtcSignerLibPaymentType(
  payment: string
): payment is BtcSignerLibPaymentTypeIdentifers {
  return payment in paymentTypeMap;
}

export function parseKnownPaymentType(
  payment: BtcSignerLibPaymentTypeIdentifers | BitcoinPaymentTypes
) {
  return isBtcSignerLibPaymentType(payment)
    ? btcSignerLibPaymentTypeToPaymentTypeMap(payment)
    : payment;
}

export type PaymentTypeMap<T> = Record<BitcoinPaymentTypes, T>;
export function whenPaymentType(mode: BitcoinPaymentTypes | BtcSignerLibPaymentTypeIdentifers) {
  return <T>(paymentMap: PaymentTypeMap<T>): T => paymentMap[parseKnownPaymentType(mode)];
}

export type SupportedPaymentType = 'p2wpkh' | 'p2tr';
export type SupportedPaymentTypeMap<T> = Record<SupportedPaymentType, T>;
export function whenSupportedPaymentType(mode: SupportedPaymentType) {
  return <T>(paymentMap: SupportedPaymentTypeMap<T>): T => paymentMap[mode];
}

/**
 * Infers the Bitcoin payment type from the derivation path.
 * Below we see path has 86 in it, per convention, this refers to taproot payments
 * @example
 * `m/86'/1'/0'/0/0`
 */
export function inferPaymentTypeFromPath(path: string): BitcoinPaymentTypes {
  const purpose = extractPurposeFromPath(path);
  switch (purpose) {
    case 84:
      return 'p2wpkh';
    case 86:
      return 'p2tr';
    case 44:
      return 'p2pkh';
    default:
      throw new Error(`Unable to infer payment type from purpose=${purpose}`);
  }
}

export function inferNetworkFromPath(path: string): NetworkModes {
  return path.split('/')[2].startsWith('0') ? 'mainnet' : 'testnet';
}

export function extractExtendedPublicKeyFromPolicy(policy: string) {
  return policy.split(']')[1];
}

export function createWalletIdDecoratedPath(policy: string, walletId: string) {
  return policy.split(']')[0].replace('[', '').replace('m', walletId);
}

export function encodeExtendedPublicKeyForNetwork(key: string, network: BitcoinNetworkModes) {
  const keychain = deriveKeychainFromXpub(key);

  if (!keychain.chainCode || !keychain.publicKey)
    throw new Error('Cannot re-encode extended key without public key material');

  return new HDKey({
    versions: HD_KEY_VERSIONS_BY_NETWORK[bitcoinNetworkModeToCoreNetworkMode(network)],
    depth: keychain.depth,
    index: keychain.index,
    parentFingerprint: keychain.parentFingerprint,
    chainCode: keychain.chainCode,
    publicKey: keychain.publicKey,
  }).publicExtendedKey;
}

// Primarily used to get the correct `Version` when passing Ledger Bitcoin
// extended public keys to the HDKey constructor
export function getHdKeyVersionsFromNetwork(network: NetworkModes) {
  return whenNetwork(network)({
    mainnet: undefined,
    testnet: HD_KEY_VERSIONS_BY_NETWORK.testnet,
  });
}

export function getBitcoinInputAddress(input: TransactionInput, bitcoinNetwork: BtcSignerNetwork) {
  if (isDefined(input.witnessUtxo))
    return getAddressFromOutScript(input.witnessUtxo.script, bitcoinNetwork);
  if (isDefined(input.nonWitnessUtxo) && isDefined(input.index))
    return getAddressFromOutScript(
      input.nonWitnessUtxo.outputs[input.index]?.script,
      bitcoinNetwork
    );
  return null;
}

export function getInputPaymentType(
  input: TransactionInput,
  network: BitcoinNetworkModes
): BitcoinPaymentTypes {
  const address = getBitcoinInputAddress(input, getBtcSignerLibNetworkConfigByMode(network));
  if (address === null) throw new Error('Input address cannot be empty');
  if (address.startsWith('bc1p') || address.startsWith('tb1p') || address.startsWith('bcrt1p'))
    return 'p2tr';
  if (address.startsWith('bc1q') || address.startsWith('tb1q') || address.startsWith('bcrt1q'))
    return 'p2wpkh';
  throw new Error('Unable to infer payment type from input address');
}

interface GetAddressArgs {
  changeIndex: number;
  addressIndex: number;
  keychain?: HDKey;
  network: BitcoinNetworkModes;
}

export function getTaprootAddress({
  changeIndex,
  addressIndex,
  keychain,
  network,
}: GetAddressArgs) {
  if (!keychain) throw new Error('Expected keychain to be provided');

  if (keychain.depth !== DerivationPathDepth.Account)
    throw new Error('Expects keychain to be on the account index');

  const addresskeychain = deriveAddressIndexKeychainFromAccount(keychain)({
    changeIndex,
    addressIndex,
  });

  if (!addresskeychain.publicKey) throw new Error('Expected publicKey to be defined');

  const payment = getTaprootPayment(addresskeychain.publicKey, network);

  if (!payment.address) throw new Error('Expected address to be defined');
  return payment.address;
}

export function getNativeSegwitAddress({
  changeIndex,
  addressIndex,
  keychain,
  network,
}: GetAddressArgs) {
  if (!keychain) throw new Error('Expected keychain to be provided');

  if (keychain.depth !== DerivationPathDepth.Account)
    throw new Error('Expects keychain to be on the account index');

  const addressKeychain = deriveAddressIndexKeychainFromAccount(keychain)({
    changeIndex,
    addressIndex,
  });

  if (!addressKeychain.publicKey) throw new Error('Expected publicKey to be defined');

  const payment = getNativeSegwitPaymentFromAddressIndex(addressKeychain, network);

  if (!payment.address) throw new Error('Expected address to be defined');
  return payment.address;
}

/**
 * @deprecated
 * Use `deriveRootBip32Keychain` in `@leather.io/crypto` instead
 */
export function mnemonicToRootNode(secretKey: string) {
  const seed = mnemonicToSeedSync(secretKey);
  return HDKey.fromMasterSeed(seed);
}

export function getPsbtTxInputs(psbtTx: btc.Transaction): TransactionInput[] {
  const inputsLength = psbtTx.inputsLength;
  const inputs: TransactionInput[] = [];
  for (let i = 0; i < inputsLength; i++) inputs.push(psbtTx.getInput(i));
  return inputs;
}

export function getPsbtTxOutputs(psbtTx: btc.Transaction): TransactionOutput[] {
  const outputsLength = psbtTx.outputsLength;
  const outputs: TransactionOutput[] = [];
  for (let i = 0; i < outputsLength; i++) outputs.push(psbtTx.getOutput(i));
  return outputs;
}

export function inferNetworkFromAddress(address: BitcoinAddress): BitcoinNetworkModes {
  if (address.startsWith('bc1')) return 'mainnet';
  if (address.startsWith('tb1')) return 'testnet';
  if (address.startsWith('bcrt1')) return 'regtest';

  const firstChar = address[0];

  if (firstChar === '1' || firstChar === '3') return 'mainnet';
  if (firstChar === 'm' || firstChar === 'n') return 'testnet';
  if (firstChar === '2') return 'testnet';

  throw new Error('Invalid or unsupported Bitcoin address format');
}

export function inferPaymentTypeFromAddress(address: BitcoinAddress): SupportedPaymentType {
  if (address.startsWith('bc1q') || address.startsWith('tb1q') || address.startsWith('bcrt1q'))
    return 'p2wpkh';

  if (address.startsWith('bc1p') || address.startsWith('tb1p') || address.startsWith('bcrt1p'))
    return 'p2tr';

  throw new Error('Unable to infer payment type from address');
}

export function getBitcoinInputValue(input: TransactionInput) {
  if (isDefined(input.witnessUtxo)) return Number(input.witnessUtxo.amount);
  if (isDefined(input.nonWitnessUtxo) && isDefined(input.index))
    return Number(input.nonWitnessUtxo.outputs[input.index]?.amount);
  // logger.warn('Unable to find either `witnessUtxo` or `nonWitnessUtxo` in input. Defaulting to 0');
  return 0;
}

export function isNativeSegwitDerivationPath(path: string) {
  return extractPurposeFromPath(path) === 84;
}

export function isTaprootDerivationPath(path: string) {
  return extractPurposeFromPath(path) === 86;
}

export function isTaprootPayer(payer: BitcoinPayer | null): payer is BitcoinTaprootPayer {
  return !!payer && isTaprootDerivationPath(payer.keyOrigin);
}
