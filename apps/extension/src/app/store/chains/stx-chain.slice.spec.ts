import { describe, expect, test } from 'vitest';

import { fingerprintMigration, userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { stxChainSlice } from './stx-chain.slice';

const fingerprintA = 'a1b2c3d4';
const fingerprintB = 'e5f6a7b8';

describe('stxChainSlice', () => {
  test('removes the stx chain state for a removed wallet', () => {
    const state = {
      [fingerprintA]: { highestAccountIndex: 3, currentAccountStacksDescriptor: 'descA' },
      [fingerprintB]: { highestAccountIndex: 1, currentAccountStacksDescriptor: 'descB' },
    };

    const result = stxChainSlice.reducer(state, userRemovesWallet({ fingerprint: fingerprintA }));

    expect(result[fingerprintA]).toBeUndefined();
    expect(result[fingerprintB]).toEqual({
      highestAccountIndex: 1,
      currentAccountStacksDescriptor: 'descB',
    });
  });

  test('does not resurrect a removed wallet index when the same seed is re-added', () => {
    const removed = stxChainSlice.reducer(
      { [fingerprintA]: { highestAccountIndex: 5, currentAccountStacksDescriptor: 'descA' } },
      userRemovesWallet({ fingerprint: fingerprintA })
    );

    expect(removed[fingerprintA]).toBeUndefined();

    const readded = stxChainSlice.reducer(
      removed,
      userAddsWallet({
        wallet: { fingerprint: fingerprintA, createdOn: null, type: 'software' },
        accountKeychains: [],
      })
    );

    expect(readded[fingerprintA]).toEqual({
      highestAccountIndex: 0,
      currentAccountStacksDescriptor: '',
    });
  });

  test('preserves highestAccountIndex across the fingerprint migration sequence (migrate first)', () => {
    let state = stxChainSlice.reducer(
      {
        [assumedZeroFingerprint]: {
          highestAccountIndex: 3,
          currentAccountStacksDescriptor: 'descLegacy',
        },
      },
      fingerprintMigration(fingerprintA)
    );
    state = stxChainSlice.reducer(
      state,
      userRemovesWallet({ fingerprint: assumedZeroFingerprint })
    );
    state = stxChainSlice.reducer(
      state,
      userAddsWallet({
        wallet: { fingerprint: fingerprintA, createdOn: null, type: 'ledger' },
        accountKeychains: [],
      })
    );

    expect(state[assumedZeroFingerprint]).toBeUndefined();
    expect(state[fingerprintA]).toEqual({
      highestAccountIndex: 3,
      currentAccountStacksDescriptor: 'descLegacy',
    });
  });

  test('creates the first account for a fingerprint at the payload index', () => {
    const result = stxChainSlice.reducer(
      {},
      stxChainSlice.actions.createNewAccount({
        fingerprint: fingerprintA,
        accountIndex: 0,
        descriptor: 'descA',
      })
    );

    expect(result[fingerprintA]).toEqual({
      highestAccountIndex: 0,
      currentAccountStacksDescriptor: 'descA',
    });
  });

  test('advances highestAccountIndex to the payload index on existing state', () => {
    const result = stxChainSlice.reducer(
      { [fingerprintA]: { highestAccountIndex: 2, currentAccountStacksDescriptor: 'old' } },
      stxChainSlice.actions.createNewAccount({
        fingerprint: fingerprintA,
        accountIndex: 3,
        descriptor: 'descA',
      })
    );

    expect(result[fingerprintA]).toEqual({
      highestAccountIndex: 3,
      currentAccountStacksDescriptor: 'descA',
    });
  });

  test('does not decrease highestAccountIndex when a stale createNewAccount is replayed', () => {
    const result = stxChainSlice.reducer(
      { [fingerprintA]: { highestAccountIndex: 5, currentAccountStacksDescriptor: 'descA' } },
      stxChainSlice.actions.createNewAccount({
        fingerprint: fingerprintA,
        accountIndex: 3,
        descriptor: 'descStale',
      })
    );

    expect(result[fingerprintA].highestAccountIndex).toBe(5);
  });

  test('uses the absolute payload index rather than incrementing the current index', () => {
    const result = stxChainSlice.reducer(
      { [fingerprintA]: { highestAccountIndex: 2, currentAccountStacksDescriptor: 'old' } },
      stxChainSlice.actions.createNewAccount({
        fingerprint: fingerprintA,
        accountIndex: 4,
        descriptor: 'descA',
      })
    );

    expect(result[fingerprintA].highestAccountIndex).toBe(4);
  });

  test('does not decrease highestAccountIndex when a stale restore lookup completes', () => {
    const result = stxChainSlice.reducer(
      { [fingerprintA]: { highestAccountIndex: 5, currentAccountStacksDescriptor: 'descA' } },
      stxChainSlice.actions.restoreAccountIndex({
        fingerprint: fingerprintA,
        accountIndex: 2,
      })
    );

    expect(result[fingerprintA].highestAccountIndex).toBe(5);
  });

  test('sets highestAccountIndex to the exact payload index, including lower values', () => {
    const result = stxChainSlice.reducer(
      { [fingerprintA]: { highestAccountIndex: 10, currentAccountStacksDescriptor: 'descA' } },
      stxChainSlice.actions.setHighestAccountIndex({
        fingerprint: fingerprintA,
        accountIndex: 2,
      })
    );

    expect(result[fingerprintA].highestAccountIndex).toBe(2);
  });

  test('creates state at the payload index when setting for an unknown fingerprint', () => {
    const result = stxChainSlice.reducer(
      {},
      stxChainSlice.actions.setHighestAccountIndex({
        fingerprint: fingerprintA,
        accountIndex: 4,
      })
    );

    expect(result[fingerprintA]).toEqual({
      highestAccountIndex: 4,
      currentAccountStacksDescriptor: '',
    });
  });

  test('leaves state untouched when removing a wallet with no stx chain state', () => {
    const state = {
      [fingerprintB]: { highestAccountIndex: 1, currentAccountStacksDescriptor: 'descB' },
    };

    const result = stxChainSlice.reducer(state, userRemovesWallet({ fingerprint: fingerprintA }));

    expect(result).toEqual(state);
  });
});
