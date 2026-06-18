import { describe, expect, test } from 'vitest';

import { userRemovesWallet } from '@leather.io/state/wallet';

import { activeSlice, userSwitchesAccount } from './active.slice';

const fingerprint = 'deadbeef';
const otherFingerprint = 'cafebabe';

describe('activeSlice userRemovesWallet guard', () => {
  test('clears the active account when its wallet is removed', () => {
    const state = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 } },
      userRemovesWallet({ fingerprint })
    );
    expect(state.account).toBeNull();
  });

  test('keeps the active account when a different wallet is removed', () => {
    const state = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 } },
      userRemovesWallet({ fingerprint: otherFingerprint })
    );
    expect(state.account).toEqual({ fingerprint, accountIndex: 0 });
  });

  test('is a no-op when there is no active account', () => {
    const state = activeSlice.reducer({ account: null }, userRemovesWallet({ fingerprint }));
    expect(state.account).toBeNull();
  });

  test('still allows switching to a remaining account afterwards', () => {
    const removed = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 } },
      userRemovesWallet({ fingerprint })
    );
    const switched = activeSlice.reducer(
      removed,
      userSwitchesAccount({ fingerprint: otherFingerprint, accountIndex: 0 })
    );
    expect(switched.account).toEqual({ fingerprint: otherFingerprint, accountIndex: 0 });
  });
});
