import { afterEach, describe, expect, test } from 'vitest';

import * as inMemoryStore from './in-memory-storage';

afterEach(() => {
  inMemoryStore.clearAll();
});

describe('in-memory key storage', () => {
  test('stores and retrieves the decoded secret', () => {
    inMemoryStore.setKey('fp1', 'secret-mnemonic');

    expect(inMemoryStore.getKey('fp1')).toBe('secret-mnemonic');
    expect(inMemoryStore.hasKey('fp1')).toBe(true);
  });

  test('returns null and false for an unknown key', () => {
    expect(inMemoryStore.getKey('missing')).toBeNull();
    expect(inMemoryStore.hasKey('missing')).toBe(false);
  });

  test('removeKey purges only the targeted key', () => {
    inMemoryStore.setKey('fp1', 'a');
    inMemoryStore.setKey('fp2', 'b');

    inMemoryStore.removeKey('fp1');

    expect(inMemoryStore.hasKey('fp1')).toBe(false);
    expect(inMemoryStore.hasKey('fp2')).toBe(true);
  });

  test('clearAll empties the store, leaving no key resident (lock purge)', () => {
    inMemoryStore.setKey('fp1', 'a');
    inMemoryStore.setKey('fp2', 'b');

    inMemoryStore.clearAll();

    expect(inMemoryStore.hasKey('fp1')).toBe(false);
    expect(inMemoryStore.hasKey('fp2')).toBe(false);
    expect(inMemoryStore.getKey('fp1')).toBeNull();
    expect(inMemoryStore.getKey('fp2')).toBeNull();
  });

  test('getSnapshot version advances on every mutation', () => {
    const initial = inMemoryStore.getSnapshot();

    inMemoryStore.setKey('fp1', 'a');
    const afterSet = inMemoryStore.getSnapshot();
    expect(afterSet).toBeGreaterThan(initial);

    inMemoryStore.removeKey('fp1');
    const afterRemove = inMemoryStore.getSnapshot();
    expect(afterRemove).toBeGreaterThan(afterSet);

    inMemoryStore.clearAll();
    expect(inMemoryStore.getSnapshot()).toBeGreaterThan(afterRemove);
  });
});
