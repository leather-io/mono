import { describe, expect, it, vi } from 'vitest';

import { TEST_FINGERPRINT } from '@leather.io/test-config';

import { deriveIconFromAccountId } from './utils';

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray, ...values: string[]) => {
    if (typeof strings === 'string') return strings;
    return strings.reduce((result: string, str: string, i: number) => {
      return result + str + (values[i] ?? '');
    }, '');
  },
}));

const { deserializeAccountId, initializeAccount } = await import('./accounts.read');

describe(deserializeAccountId.name, () => {
  it('parses valid account id', () => {
    const result = deserializeAccountId(`${TEST_FINGERPRINT}/0`);
    expect(result).toEqual({ fingerprint: TEST_FINGERPRINT, accountIndex: 0 });
  });

  it('parses account id with higher index', () => {
    const result = deserializeAccountId(`${TEST_FINGERPRINT}/3`);
    expect(result).toEqual({ fingerprint: TEST_FINGERPRINT, accountIndex: 3 });
  });

  it('throws on missing slash', () => {
    expect(() => deserializeAccountId('noslash')).toThrow('Invalid account ID');
  });

  it('throws on empty string', () => {
    expect(() => deserializeAccountId('')).toThrow('Invalid account ID');
  });
});

describe(initializeAccount.name, () => {
  const accountId = `${TEST_FINGERPRINT}/0`;

  it('applies default status', () => {
    const account = initializeAccount({ id: accountId });
    expect(account.status).toBe('active');
  });

  it('applies default name with display index', () => {
    const account = initializeAccount({ id: accountId });
    expect(account.name).toBe('Account 1');
  });

  it('applies default name for second account', () => {
    const account = initializeAccount({ id: `${TEST_FINGERPRINT}/1` });
    expect(account.name).toBe('Account 2');
  });

  it('applies default icon via deriveIconFromAccountId', () => {
    const account = initializeAccount({ id: accountId });
    expect(account.icon).toBe(deriveIconFromAccountId(accountId));
  });

  it('preserves explicit name override', () => {
    const account = initializeAccount({ id: accountId, name: 'My Wallet' });
    expect(account.name).toBe('My Wallet');
  });

  it('preserves explicit icon override', () => {
    const account = initializeAccount({ id: accountId, icon: 'rocket' });
    expect(account.icon).toBe('rocket');
  });

  it('preserves explicit status override', () => {
    const account = initializeAccount({ id: accountId, status: 'hidden' });
    expect(account.status).toBe('hidden');
  });

  it('returns correct fingerprint and accountIndex', () => {
    const account = initializeAccount({ id: `${TEST_FINGERPRINT}/2` });
    expect(account.fingerprint).toBe(TEST_FINGERPRINT);
    expect(account.accountIndex).toBe(2);
  });
});
