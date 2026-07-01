import { describe, expect, test } from 'vitest';

import { userRemovesWallet } from '@leather.io/state/wallet';

import { userRemovesPolicy } from '../policy/policy.slice';
import { activeSlice, userSwitchesAccount, userSwitchesToPolicy } from './active.slice';

const fingerprint = 'deadbeef';
const otherFingerprint = 'cafebabe';
const policyId = `${fingerprint}/0/bc1qexamplemultisigaddressxyz`;

describe('activeSlice userRemovesWallet guard', () => {
  test('clears the active account when its wallet is removed', () => {
    const state = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 }, activePolicyId: null },
      userRemovesWallet({ fingerprint })
    );
    expect(state.account).toBeNull();
  });

  test('keeps the active account when a different wallet is removed', () => {
    const state = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 }, activePolicyId: null },
      userRemovesWallet({ fingerprint: otherFingerprint })
    );
    expect(state.account).toEqual({ fingerprint, accountIndex: 0 });
  });

  test('is a no-op when there is no active account', () => {
    const state = activeSlice.reducer(
      { account: null, activePolicyId: null },
      userRemovesWallet({ fingerprint })
    );
    expect(state.account).toBeNull();
  });

  test('still allows switching to a remaining account afterwards', () => {
    const removed = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 }, activePolicyId: null },
      userRemovesWallet({ fingerprint })
    );
    const switched = activeSlice.reducer(
      removed,
      userSwitchesAccount({ fingerprint: otherFingerprint, accountIndex: 0 })
    );
    expect(switched.account).toEqual({ fingerprint: otherFingerprint, accountIndex: 0 });
  });
});

describe('activeSlice policy pointer', () => {
  test('switching to a policy activates the parent and sets the pointer', () => {
    const state = activeSlice.reducer(
      { account: null, activePolicyId: null },
      userSwitchesToPolicy({ parent: { fingerprint, accountIndex: 0 }, policyId })
    );
    expect(state.account).toEqual({ fingerprint, accountIndex: 0 });
    expect(state.activePolicyId).toBe(policyId);
  });

  test('switching to a singlesig account clears the policy pointer', () => {
    const withPolicy = activeSlice.reducer(
      { account: null, activePolicyId: null },
      userSwitchesToPolicy({ parent: { fingerprint, accountIndex: 0 }, policyId })
    );
    const switched = activeSlice.reducer(
      withPolicy,
      userSwitchesAccount({ fingerprint, accountIndex: 1 })
    );
    expect(switched.activePolicyId).toBeNull();
  });

  test('removing the parent wallet clears the policy pointer', () => {
    const withPolicy = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 }, activePolicyId: policyId },
      userRemovesWallet({ fingerprint })
    );
    expect(withPolicy.activePolicyId).toBeNull();
  });

  test('removing a different wallet keeps the policy pointer', () => {
    const withPolicy = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 }, activePolicyId: policyId },
      userRemovesWallet({ fingerprint: otherFingerprint })
    );
    expect(withPolicy.activePolicyId).toBe(policyId);
  });

  test('removing the active policy clears the pointer and keeps the parent account', () => {
    const result = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 }, activePolicyId: policyId },
      userRemovesPolicy({ policyId })
    );
    expect(result.activePolicyId).toBeNull();
    expect(result.account).toEqual({ fingerprint, accountIndex: 0 });
  });

  test('removing a non-active policy keeps the pointer', () => {
    const result = activeSlice.reducer(
      { account: { fingerprint, accountIndex: 0 }, activePolicyId: policyId },
      userRemovesPolicy({ policyId: `${otherFingerprint}/0/bc1qothermultisig` })
    );
    expect(result.activePolicyId).toBe(policyId);
  });
});
