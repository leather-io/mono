import { unpadHex } from '@leather.io/crypto';
import { assertExistence } from '@leather.io/utils';

export interface StoreKeys {
  mnemonicStoreKey: string;
  passphraseStoreKey: string;
}

/**
 * Creates store keys for expo-secure-store (v1)
 * @param paddedFingerprint - Zero-padded hex fingerprint e.g. 000f25e8
 * @returns Store keys for mnemonic and passphrase
 * @example
 * getSecureStoreKeyV1("000f25e8")
 * // => { mnemonicStoreKey: "f25e8", passphraseStoreKey: "f25e8_passphrase" }
 */
export function getSecureStoreKeyV1(paddedFingerprint: string): StoreKeys {
  try {
    const unpaddedFingerprint = unpadHex(paddedFingerprint);
    return {
      mnemonicStoreKey: unpaddedFingerprint,
      passphraseStoreKey: `${unpaddedFingerprint}_passphrase`,
    };
  } catch {
    throw new Error('Incorrect fingerprint provided to unpadHex');
  }
}

/**
 * Creates store keys for expo-secure-store (v2)
 * @param paddedFingerprint - Zero-padded hex fingerprint e.g. 000f25e8
 * @returns Store keys for mnemonic and passphrase
 * @example
 * getSecureStoreKeyV2("000f25e8")
 * // => { mnemonicStoreKey: "mnemonic_v2_000f25e8", passphraseStoreKey: "mnemonic_v2_passphrase_000f25e8" }
 */
export function getSecureStoreKeyV2(paddedFingerprint: string): StoreKeys {
  const keyPrefix = 'mnemonic_v2';
  return {
    mnemonicStoreKey: `${keyPrefix}_${paddedFingerprint}`,
    passphraseStoreKey: `${keyPrefix}_passphrase_${paddedFingerprint}`,
  };
}

/**
 * Generates all SecureStore key versions for a fingerprint.
 * @param fingerprint - Zero-padded hex fingerprint (e.g., "000f25e8")
 * @returns Array of store keys, oldest version first, latest last
 * @example
 * getSecureStoreKeys("000f25e8")
 * // => [
 * //   { mnemonicStoreKey: "f25e8", passphraseStoreKey: "f25e8_passphrase" },
 * //   { mnemonicStoreKey: "mnemonic_v2_000f25e8", passphraseStoreKey: "mnemonic_v2_passphrase_000f25e8" }
 * // ]
 */
export function getSecureStoreKeys(fingerprint: string): StoreKeys[] {
  return [getSecureStoreKeyV1(fingerprint), getSecureStoreKeyV2(fingerprint)];
}
export function getLatestStoreKeys(storeKeys: StoreKeys[]) {
  const latestStoreKeys = storeKeys[storeKeys.length - 1];
  assertExistence(latestStoreKeys, 'We always should have latest store keys');
  return latestStoreKeys;
}
