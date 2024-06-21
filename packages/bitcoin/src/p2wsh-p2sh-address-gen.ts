import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 } from '@noble/hashes/sha256';
import { base58check } from '@scure/base';

import { deriveBip39MnemonicFromSeed, deriveRootBip32Keychain } from '@leather.io/crypto';
import { NetworkModes } from '@leather.io/models';

/**
 * @deprecated
 * Use `deriveBip39MnemonicFromSeed` from `@leather.io/crypto`
 */
export const deriveBtcBip49SeedFromMnemonic = deriveBip39MnemonicFromSeed;

/**
 * @deprecated
 * Use `deriveRootBip32Keychain` from `@leather.io/crypto`
 */
export const deriveRootBtcKeychain = deriveRootBip32Keychain;

export function decodeCompressedWifPrivateKey(key: string) {
  // https://en.bitcoinwiki.org/wiki/Wallet_import_format
  // Decode Compressed WIF format private key
  const compressedWifFormatPrivateKey = base58check(sha256).decode(key);
  // Drop leading network byte, trailing public key SEC format byte
  return compressedWifFormatPrivateKey.slice(1, compressedWifFormatPrivateKey.length - 1);
}

// https://en.bitcoin.it/wiki/List_of_address_prefixes
const payToScriptHashMainnetPrefix = 0x05;
export const payToScriptHashTestnetPrefix = 0xc4;

const payToScriptHashPrefixMap: Record<NetworkModes, number> = {
  mainnet: payToScriptHashMainnetPrefix,
  testnet: payToScriptHashTestnetPrefix,
};

function hash160(input: Uint8Array) {
  return ripemd160(sha256(input));
}

export function makePayToScriptHashKeyHash(publicKey: Uint8Array) {
  return hash160(publicKey);
}

export function makePayToScriptHashAddressBytes(keyHash: Uint8Array) {
  const redeemScript = Uint8Array.from([
    ...Uint8Array.of(0x00),
    ...Uint8Array.of(keyHash.length),
    ...keyHash,
  ]);
  return hash160(redeemScript);
}

export function makePayToScriptHashAddress(addressBytes: Uint8Array, network: NetworkModes) {
  const networkByte = payToScriptHashPrefixMap[network];
  const addressWithPrefix = Uint8Array.from([networkByte, ...addressBytes]);
  return base58check(sha256).encode(addressWithPrefix);
}

export function publicKeyToPayToScriptHashAddress(publicKey: Uint8Array, network: NetworkModes) {
  const hash = makePayToScriptHashKeyHash(publicKey);
  const addrBytes = makePayToScriptHashAddressBytes(hash);
  return makePayToScriptHashAddress(addrBytes, network);
}
