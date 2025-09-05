import { useMemo } from 'react';

// Simple deep equality check using JSON.stringify (not for all cases, but sufficient for query keys)
function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Creates stable query keys to prevent frequent re-renders and cancellations
 */
export function useStableQueryKey<T>(key: T): T {
  return useMemo(() => key, [JSON.stringify(key)]);
}

/**
 * More sophisticated version using deep equality
 */
export function useDeepStableQueryKey<T>(key: T): T {
  return useMemo(() => key, [key]);
}

// Custom equality comparison for query keys
let previousKey: unknown;
let stableKey: unknown;

export function useStableQueryKeyWithComparison<T>(key: T): T {
  return useMemo(() => {
    if (isEqual(key, previousKey)) {
      return stableKey as T;
    }
    previousKey = key;
    stableKey = key;
    return key;
  }, [key]);
}
