import { assumedZeroFingerprint } from '@shared/utils';

import { selectCurrentAccount } from './software-key.selectors';

const mocks = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));

vi.mock('@app/common/initial-search-params', () => ({
  initialSearchParams: mocks.searchParams,
}));

const activeAccount = { fingerprint: 'abcd1234', accountIndex: 1 };

describe('selectCurrentAccount', () => {
  beforeEach(() => {
    for (const key of Array.from(mocks.searchParams.keys())) {
      mocks.searchParams.delete(key);
    }
  });

  test('uses the account pinned in the url params when the user has not switched accounts', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(selectCurrentAccount.resultFunc(activeAccount, false)).toEqual({
      fingerprint: 'feedface',
      accountIndex: 5,
    });
  });

  test('uses the active account once the user switches accounts', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(selectCurrentAccount.resultFunc(activeAccount, true)).toEqual(activeAccount);
  });

  test('uses the active account when no account is pinned in the url params', () => {
    expect(selectCurrentAccount.resultFunc(activeAccount, false)).toEqual(activeAccount);
  });

  test('falls back to the first account of the assumed-zero fingerprint', () => {
    expect(selectCurrentAccount.resultFunc(null, false)).toEqual({
      fingerprint: assumedZeroFingerprint,
      accountIndex: 0,
    });
  });

  test('ignores a non-integer account index in the url params', () => {
    mocks.searchParams.set('accountIndex', 'not-a-number');

    expect(selectCurrentAccount.resultFunc(activeAccount, false)).toEqual(activeAccount);
  });
});
