import { decodeText, encodeText } from '@shared/utils/text-encoding';

/**
 * In-memory key storage that keeps sensitive key material outside of Redux.
 * This prevents keys from being exposed via Redux DevTools, state snapshots, or logging.
 *
 * Keys are stored as encoded text in a private Map that is not accessible from
 * outside this module.
 *
 * The store is observable via `subscribe`/`getSnapshot` for use with
 * `useSyncExternalStore`, allowing React components to reactively re-render
 * when keys are added, removed, or cleared.
 */

const keys = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;

function emitChange() {
  version++;
  listeners.forEach(listener => listener());
}

/**
 * Subscribe to store changes. Compatible with `useSyncExternalStore`.
 * @returns Unsubscribe function
 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get a snapshot version of the store. Compatible with `useSyncExternalStore`.
 * Returns a stable value between mutations.
 */
export function getSnapshot(): number {
  return version;
}

/**
 * Store a key in memory
 * @param fingerprint - The wallet fingerprint
 * @param secretKey - The secret key or mnemonic (will be encoded)
 */
export function setKey(fingerprint: string, secretKey: string): void {
  keys.set(fingerprint, encodeText(secretKey));
  emitChange();
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
  emitChange();
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
  emitChange();
}

/**
 * Get the number of stored keys
 * @returns The count of stored keys
 */
export function getKeyCount(): number {
  return keys.size;
}
