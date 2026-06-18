import { describe, expect, test } from 'vitest';

import {
  clearKeychainSelectorCaches,
  createKeychainSelector,
  registerKeychainSelectorCache,
} from './keychain-selector-cache';

function makeRegisteredSelector() {
  return registerKeychainSelectorCache(
    createKeychainSelector(
      [(seed: string) => seed, (_seed: string, version: number) => version],
      seed => ({ derived: seed })
    )
  );
}

describe('keychain selector cache', () => {
  test('reuses the cached result for repeated identical calls', () => {
    const selector = makeRegisteredSelector();

    const first = selector('seed', 1);
    const second = selector('seed', 1);

    expect(second).toBe(first);
    expect(selector.recomputations()).toBe(1);
  });

  test('retains only a single entry, recomputing when a prior version is requested again', () => {
    const selector = makeRegisteredSelector();

    selector('seed', 1);
    selector('seed', 2);
    selector('seed', 1);

    expect(selector.recomputations()).toBe(3);
  });

  test('purges retained results on clearKeychainSelectorCaches', () => {
    const selector = makeRegisteredSelector();

    const before = selector('seed', 1);
    clearKeychainSelectorCaches();
    const after = selector('seed', 1);

    expect(after).not.toBe(before);
    expect(selector.recomputations()).toBe(2);
  });
});
