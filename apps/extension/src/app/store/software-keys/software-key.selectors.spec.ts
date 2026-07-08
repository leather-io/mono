import type { WalletStore } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { selectCurrentAccount } from './software-key.selectors';

const mocks = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));

vi.mock('@app/common/initial-search-params', () => ({
  initialSearchParams: mocks.searchParams,
}));

const activeAccount = { fingerprint: 'abcd1234', accountIndex: 1 };

function createWalletEntities(fingerprints: string[]): Record<string, WalletStore> {
  const entities: Record<string, WalletStore> = {};
  for (const value of fingerprints)
    entities[value] = { fingerprint: value, type: 'software', name: 'Wallet', createdOn: null };
  return entities;
}

describe('selectCurrentAccount', () => {
  beforeEach(() => {
    for (const key of Array.from(mocks.searchParams.keys())) {
      mocks.searchParams.delete(key);
    }
  });

  test('uses the account pinned in the url params when the user has not switched accounts', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(
        activeAccount,
        false,
        createWalletEntities(['feedface']),
        null
      )
    ).toEqual({
      fingerprint: 'feedface',
      accountIndex: 5,
    });
  });

  test('falls back to the active account when the pinned fingerprint has no wallet', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(activeAccount, false, createWalletEntities([]), null)
    ).toEqual(activeAccount);
  });

  test('uses the active account once the user switches accounts', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(activeAccount, true, createWalletEntities(['feedface']), null)
    ).toEqual(activeAccount);
  });

  test('uses the active account when no account is pinned in the url params', () => {
    expect(
      selectCurrentAccount.resultFunc(activeAccount, false, createWalletEntities([]), null)
    ).toEqual(activeAccount);
  });

  test('falls back to the first account of the assumed-zero fingerprint', () => {
    expect(selectCurrentAccount.resultFunc(null, false, createWalletEntities([]), null)).toEqual({
      fingerprint: assumedZeroFingerprint,
      accountIndex: 0,
    });
  });

  test('ignores a non-integer account index in the url params', () => {
    mocks.searchParams.set('accountIndex', 'not-a-number');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(
        activeAccount,
        false,
        createWalletEntities(['feedface']),
        null
      )
    ).toEqual({ fingerprint: 'feedface', accountIndex: 1 });
  });

  test('ignores the pinned url account and uses the active account when a policy is active', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(
        activeAccount,
        false,
        createWalletEntities(['feedface']),
        'abcd1234/0/mainnet'
      )
    ).toEqual(activeAccount);
  });

  test('uses the pinned url account when no policy is active', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(
        activeAccount,
        false,
        createWalletEntities(['feedface']),
        null
      )
    ).toEqual({ fingerprint: 'feedface', accountIndex: 5 });
  });

  test('uses the active account when the user has switched and no policy is active', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(activeAccount, true, createWalletEntities(['feedface']), null)
    ).toEqual(activeAccount);
  });

  test('uses the active account when a policy is active and no account is pinned', () => {
    expect(
      selectCurrentAccount.resultFunc(
        activeAccount,
        false,
        createWalletEntities([]),
        'abcd1234/0/mainnet'
      )
    ).toEqual(activeAccount);
  });
});
