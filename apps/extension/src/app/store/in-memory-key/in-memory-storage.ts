import { decodeText, encodeText } from '@shared/utils/text-encoding';

/**
 * In-memory key storage that keeps sensitive key material outside of Redux.
 * This prevents keys from being exposed via Redux DevTools, state snapshots, or logging.
 *
 * Keys are stored as encoded text in a private Map that is not accessible from
 * outside this module.
 */

const keys = new Map<string, string>();

/**
 * Store a key in memory
 * @param fingerprint - The wallet fingerprint
 * @param secretKey - The secret key or mnemonic (will be encoded)
 */
export function setKey(fingerprint: string, secretKey: string): void {
  keys.set(fingerprint, encodeText(secretKey));
}

/**
 * Retrieve a key from in-memory storage
 * @param fingerprint - The wallet fingerprint
 * @returns The decoded secret key, or null if not found
 */
export function getKey(fingerprint: string): string | null {
  const encodedKey = keys.get(fingerprint);
  if (!encodedKey) return null;
  return decodeText(encodedKey);
}

/**
 * Check if a key exists in storage
 * @param fingerprint - The wallet fingerprint
 * @returns true if the key exists
 */
export function hasKey(fingerprint: string): boolean {
  return keys.has(fingerprint);
}

/**
 * Remove a key from storage
 * @param fingerprint - The wallet fingerprint
 */
export function removeKey(fingerprint: string): void {
  keys.delete(fingerprint);
}

/**
 * Get all stored fingerprints (not the keys themselves)
 * @returns Array of fingerprints
 */
export function getFingerprints(): string[] {
  return Array.from(keys.keys());
}

/**
 * Clear all keys from storage
 */
export function clearAll(): void {
  keys.clear();
}

/**
 * Get the number of stored keys
 * @returns The count of stored keys
 */
export function getKeyCount(): number {
  return keys.size;
}
