import { createEntityAdapter } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';

import { TEST_FINGERPRINT } from '@leather.io/test-config';

import { AccountStore } from './accounts/utils';
import {
  destructAccountIdentifier,
  getWalletAccountsByAccountId,
  selectNextDistinctAccountIcon,
} from './utils';

describe(destructAccountIdentifier.name, () => {
  it('parses valid account identifiers', () => {
    const result = destructAccountIdentifier(`${TEST_FINGERPRINT}/0`);
    expect(result).toEqual({ fingerprint: TEST_FINGERPRINT, accountIndex: 0 });
  });

  it('parses account identifier with higher index', () => {
    const result = destructAccountIdentifier(`${TEST_FINGERPRINT}/5`);
    expect(result).toEqual({ fingerprint: TEST_FINGERPRINT, accountIndex: 5 });
  });

  it('throws on missing slash', () => {
    expect(() => destructAccountIdentifier('abc123')).toThrow();
  });

  it('throws when accountIndex is NaN', () => {
    expect(() => destructAccountIdentifier(`${TEST_FINGERPRINT}/abc`)).toThrow();
  });

  it('throws on extra segments', () => {
    expect(() => destructAccountIdentifier(`${TEST_FINGERPRINT}/0/extra`)).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => destructAccountIdentifier('')).toThrow();
  });
});

describe(getWalletAccountsByAccountId.name, () => {
  const adapter = createEntityAdapter<AccountStore, string>({
    selectId: account => account.id,
  });

  it('filters accounts by fingerprint', () => {
    const state = adapter.addMany(adapter.getInitialState(), [
      { id: `${TEST_FINGERPRINT}/0` },
      { id: `${TEST_FINGERPRINT}/1` },
      { id: 'otherprint/0' },
    ]);

    const result = getWalletAccountsByAccountId(state, `${TEST_FINGERPRINT}/0`);
    expect(result).toHaveLength(2);
    expect(result.map(a => a.id)).toEqual([`${TEST_FINGERPRINT}/0`, `${TEST_FINGERPRINT}/1`]);
  });

  it('returns empty array when no accounts match', () => {
    const state = adapter.addMany(adapter.getInitialState(), [{ id: 'otherprint/0' }]);

    const result = getWalletAccountsByAccountId(state, `${TEST_FINGERPRINT}/0`);
    expect(result).toHaveLength(0);
  });

  it('handles empty state', () => {
    const state = adapter.getInitialState();
    const result = getWalletAccountsByAccountId(state, `${TEST_FINGERPRINT}/0`);
    expect(result).toHaveLength(0);
  });
});

describe(selectNextDistinctAccountIcon.name, () => {
  it('returns sparkles for first wallet', () => {
    const icon = selectNextDistinctAccountIcon([]);
    expect(icon).toBe('sparkles');
  });

  it('avoids preceding icon', () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(selectNextDistinctAccountIcon(['sparkles'], 'pizza'));
    }
    expect(results.has('pizza')).toBe(false);
  });

  it('returns a valid account icon', () => {
    const icon = selectNextDistinctAccountIcon(['sparkles', 'pizza'], 'sparkles');
    expect(typeof icon).toBe('string');
    expect(icon.length).toBeGreaterThan(0);
  });
});
