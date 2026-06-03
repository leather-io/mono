import { describe, expect, test } from 'vitest';

import { userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

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

  test('leaves state untouched when removing a wallet with no stx chain state', () => {
    const state = {
      [fingerprintB]: { highestAccountIndex: 1, currentAccountStacksDescriptor: 'descB' },
    };

    const result = stxChainSlice.reducer(state, userRemovesWallet({ fingerprint: fingerprintA }));

    expect(result).toEqual(state);
  });
});
