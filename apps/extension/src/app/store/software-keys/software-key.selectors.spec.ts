import { base64urlnopad } from '@scure/base';

import type { WalletStore } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import {
  selectCurrentAccount,
  selectWalletAuthenticationCapabilities,
} from './software-key.selectors';

const mocks = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));

vi.mock('@app/common/initial-search-params', () => ({
  initialSearchParams: mocks.searchParams,
}));

const activeAccount = { fingerprint: 'abcd1234', accountIndex: 1 };
const platformUnlock = {
  credentialId: base64urlnopad.encode(new Uint8Array([1, 2, 3])),
  iv: base64urlnopad.encode(new Uint8Array(12).fill(4)),
  prfInput: base64urlnopad.encode(new Uint8Array(32).fill(5)),
  registrationTag: 'ABC234',
  version: 1,
  wrappedEncryptionKey: base64urlnopad.encode(new Uint8Array(112).fill(6)),
};

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
      selectCurrentAccount.resultFunc(activeAccount, false, createWalletEntities(['feedface']))
    ).toEqual({
      fingerprint: 'feedface',
      accountIndex: 5,
    });
  });

  test('falls back to the active account when the pinned fingerprint has no wallet', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(selectCurrentAccount.resultFunc(activeAccount, false, createWalletEntities([]))).toEqual(
      activeAccount
    );
  });

  test('uses the active account once the user switches accounts', () => {
    mocks.searchParams.set('accountIndex', '5');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(activeAccount, true, createWalletEntities(['feedface']))
    ).toEqual(activeAccount);
  });

  test('uses the active account when no account is pinned in the url params', () => {
    expect(selectCurrentAccount.resultFunc(activeAccount, false, createWalletEntities([]))).toEqual(
      activeAccount
    );
  });

  test('falls back to the first account of the assumed-zero fingerprint', () => {
    expect(selectCurrentAccount.resultFunc(null, false, createWalletEntities([]))).toEqual({
      fingerprint: assumedZeroFingerprint,
      accountIndex: 0,
    });
  });

  test('ignores a non-integer account index in the url params', () => {
    mocks.searchParams.set('accountIndex', 'not-a-number');
    mocks.searchParams.set('fingerprint', 'feedface');

    expect(
      selectCurrentAccount.resultFunc(activeAccount, false, createWalletEntities(['feedface']))
    ).toEqual({ fingerprint: 'feedface', accountIndex: 1 });
  });
});

describe(selectWalletAuthenticationCapabilities.name, () => {
  test('normalizes legacy state without a mode to password authentication', () => {
    expect(selectWalletAuthenticationCapabilities.resultFunc({ ids: ['wallet'] })).toEqual({
      authenticationMode: 'password',
      biometrics: false,
      password: true,
      valid: true,
    });
  });

  test('reports complete password-only state', () => {
    expect(
      selectWalletAuthenticationCapabilities.resultFunc({
        authenticationMode: 'password',
        ids: ['wallet'],
        salt: 'salt',
      })
    ).toEqual({
      authenticationMode: 'password',
      biometrics: false,
      password: true,
      valid: true,
    });
  });

  test('reports complete biometric-only state without inferring it from missing salt', () => {
    expect(
      selectWalletAuthenticationCapabilities.resultFunc({
        authenticationMode: 'biometric-only',
        ids: ['wallet'],
        platformUnlock,
      })
    ).toEqual({
      authenticationMode: 'biometric-only',
      biometrics: true,
      password: false,
      valid: true,
    });
  });

  test.each([
    { authenticationMode: 'future-mode', ids: ['wallet'] },
    { authenticationMode: 'password', ids: ['wallet'] },
    { authenticationMode: 'biometric-only', ids: ['wallet'] },
    { ids: ['wallet'], platformUnlock: { invalid: true } },
    { ids: ['wallet'], salt: '' },
    { ids: ['wallet'], salt: 123 },
    {
      authenticationMode: 'password',
      ids: ['wallet'],
      platformUnlock,
      salt: 'salt',
    },
    {
      authenticationMode: 'biometric-only',
      ids: ['wallet'],
      platformUnlock,
      salt: 'unexpected',
    },
  ])('fails closed for unknown or inconsistent state', state => {
    expect(selectWalletAuthenticationCapabilities.resultFunc(state)).toEqual({
      authenticationMode: null,
      biometrics: false,
      password: false,
      valid: false,
    });
  });

  test('treats a clean profile without software wallets as valid but not authenticatable', () => {
    expect(selectWalletAuthenticationCapabilities.resultFunc({ ids: [] })).toEqual({
      authenticationMode: 'password',
      biometrics: false,
      password: false,
      valid: true,
    });
  });
});
