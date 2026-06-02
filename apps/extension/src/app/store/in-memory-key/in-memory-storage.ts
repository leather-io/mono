import { decodeText, encodeText } from '@shared/utils/text-encoding';

/**
 * In-memory key storage that keeps sensitive key material outside of Redux.
 * The protection comes from this: keys live in a private Map that is never put
 * into Redux state, so they can't leak via Redux DevTools, state snapshots,
 * persistence, or logging.
 *
 * Note: `encodeText`/`decodeText` is a plain TextEncoder/TextDecoder roundtrip,
 * not encryption — it does not add any security on its own.
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
  if (encodedKey === undefined) return null;
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
 * Clear all keys from storage
 */
export function clearAll(): void {
  keys.clear();
  emitChange();
}
