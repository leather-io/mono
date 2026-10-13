import { createSelectorCreator, lruMemoize } from '@reduxjs/toolkit';

interface ClearableKeychainSelector {
  clearCache(): void;
  memoizedResultFunc: { clearCache(): void };
}

const keychainCacheClearers = new Set<() => void>();

// Keychain selectors derive root private keys from the cleartext mnemonic, so
// their results must not linger in reselect's session-lifetime memo cache (the
// default `weakMapMemoize` retains a strong entry per primitive `version` bump).
// Bound each to a single entry and register its clearers so the derived key
// material can be purged on lock, sign-out, and wallet removal — extending the
// no-memoization rule documented above `useActiveWalletSecretKey`.
export const createKeychainSelector = createSelectorCreator({
  memoize: lruMemoize,
  memoizeOptions: { maxSize: 1 },
  argsMemoize: lruMemoize,
  argsMemoizeOptions: { maxSize: 1 },
});

export function registerKeychainSelectorCache<T extends ClearableKeychainSelector>(selector: T): T {
  keychainCacheClearers.add(() => {
    selector.clearCache();
    selector.memoizedResultFunc.clearCache();
  });
  return selector;
}

export function clearKeychainSelectorCaches(): void {
  keychainCacheClearers.forEach(clear => clear());
}
