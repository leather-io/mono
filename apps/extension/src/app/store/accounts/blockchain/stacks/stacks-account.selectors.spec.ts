import { STANDARD_BIP_FAKE_MNEMONIC } from '@tests/mocks/constants';

import { createDescriptor } from '@leather.io/crypto';
import { defaultCurrentNetwork } from '@leather.io/models';
import { makeStxKeyOrigin } from '@leather.io/stacks';
import { resetWallet } from '@leather.io/state';
import type { StacksKeychain } from '@leather.io/state/keychains';

import { store } from '@app/store';
import { stxChainSlice } from '@app/store/chains/stx-chain.slice';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '@app/store/in-memory-key/keychain-selector-cache';
import { keySlice } from '@app/store/software-keys/software-key.slice';

import { selectStacksAccountById, selectStacksAccountState } from './stacks-account.selectors';

const stxPublicKey = '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893';

function makeStacksLedgerKeychain(fingerprint: string, accountIndex: number): StacksKeychain {
  const keyOrigin = makeStxKeyOrigin(fingerprint, accountIndex);
  return { chain: 'stacks', descriptor: createDescriptor(keyOrigin, stxPublicKey) };
}

const selectLedgerAccounts = selectStacksAccountState.dependencies[0];

describe('selectLedgerAccounts', () => {
  test('derives accountIndex from the key-origin path across multiple Ledger devices', () => {
    const deviceA = 'aaaaaaaa';
    const deviceB = 'bbbbbbbb';
    const keychains = [
      makeStacksLedgerKeychain(deviceA, 0),
      makeStacksLedgerKeychain(deviceA, 1),
      makeStacksLedgerKeychain(deviceA, 2),
      makeStacksLedgerKeychain(deviceB, 0),
      makeStacksLedgerKeychain(deviceB, 1),
      makeStacksLedgerKeychain(deviceB, 2),
    ];

    const accounts = selectLedgerAccounts.resultFunc(defaultCurrentNetwork, keychains);

    expect(
      accounts.map(account => ({
        fingerprint: account.fingerprint,
        index: account.index,
        accountIndex: account.accountIndex,
      }))
    ).toEqual([
      { fingerprint: deviceA, index: 0, accountIndex: 0 },
      { fingerprint: deviceA, index: 1, accountIndex: 1 },
      { fingerprint: deviceA, index: 2, accountIndex: 2 },
      { fingerprint: deviceB, index: 0, accountIndex: 0 },
      { fingerprint: deviceB, index: 1, accountIndex: 1 },
      { fingerprint: deviceB, index: 2, accountIndex: 2 },
    ]);
  });

  test('keeps accountIndex aligned with derivation index for a single Ledger device', () => {
    const fingerprint = 'deadbeef';
    const keychains = [
      makeStacksLedgerKeychain(fingerprint, 0),
      makeStacksLedgerKeychain(fingerprint, 1),
      makeStacksLedgerKeychain(fingerprint, 2),
    ];

    const accounts = selectLedgerAccounts.resultFunc(defaultCurrentNetwork, keychains);

    expect(accounts.map(account => account.index)).toEqual([0, 1, 2]);
  });
});

describe('software account index resolution', () => {
  const fingerprint = 'test-fingerprint';

  beforeEach(() => {
    inMemoryStore.setKey(fingerprint, STANDARD_BIP_FAKE_MNEMONIC);
    store.dispatch(
      keySlice.actions.addNewWallet({
        type: 'software',
        id: fingerprint,
        encryptedSecretKey: 'encrypted',
      })
    );
    // Only account index 0 is enumerated for this wallet.
    store.dispatch(stxChainSlice.actions.restoreAccountIndex({ fingerprint, accountIndex: 0 }));
  });

  afterEach(() => {
    store.dispatch(resetWallet());
    inMemoryStore.clearAll();
    clearKeychainSelectorCaches();
  });

  test('enumerated account state omits an index beyond highestAccountIndex', () => {
    const version = inMemoryStore.getSnapshot();

    const softwareAccounts = selectStacksAccountState(store.getState(), version).filter(
      account => account.fingerprint === fingerprint
    );

    expect(softwareAccounts.map(account => account.index)).toEqual([0]);
    // This is the input that silently dead-ended legacy auth: a stored
    // permission's index is absent from the enumerated list, so a `.find`
    // over it returns undefined.
    expect(softwareAccounts.find(account => account.index === 5)).toBeUndefined();
  });

  test('does not throw for a fractional highestAccountIndex and enumerates a single account', () => {
    store.dispatch(stxChainSlice.actions.restoreAccountIndex({ fingerprint, accountIndex: 2.5 }));
    const version = inMemoryStore.getSnapshot();

    expect(() => selectStacksAccountState(store.getState(), version)).not.toThrow();

    const softwareAccounts = selectStacksAccountState(store.getState(), version).filter(
      account => account.fingerprint === fingerprint
    );
    expect(softwareAccounts.map(account => account.index)).toEqual([0]);
  });

  test('selectStacksAccountById derives an account beyond the enumerated range', () => {
    const version = inMemoryStore.getSnapshot();

    const account = selectStacksAccountById(store.getState(), version, {
      fingerprint,
      accountIndex: 5,
    });

    expect(account).toBeDefined();
    expect(account?.type).toBe('software');
    expect(account?.index).toBe(5);
  });

  test('selectStacksAccountById resolves index 0 to the same account as the enumerated state', () => {
    const version = inMemoryStore.getSnapshot();

    const enumerated = selectStacksAccountState(store.getState(), version).find(
      account => account.fingerprint === fingerprint && account.index === 0
    );
    const byId = selectStacksAccountById(store.getState(), version, {
      fingerprint,
      accountIndex: 0,
    });

    expect(byId?.address).toBeDefined();
    expect(byId?.address).toBe(enumerated?.address);
  });
});
