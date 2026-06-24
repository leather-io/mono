import { describe, expect, test } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { resetWallet } from '@leather.io/state';
import { userRemovesWallet } from '@leather.io/state/wallet';

import { type PolicyStore, makePolicyId } from './policy-store.utils';
import { policySlice, userAddsPolicyAccount } from './policy.slice';

const { reducer, getInitialState } = policySlice;

const fingerprintA = 'abcd1234';
const fingerprintB = 'beef5678';
const parentAccountIdA = makeAccountIdentifer(fingerprintA, 0);
const parentAccountIdB = makeAccountIdentifer(fingerprintB, 0);
const multisigAddress = 'bc1qexampleexampleexampleexampleexampleexamplexyz';

function makeBitcoinPolicy(
  parentAccountId: string,
  { address = multisigAddress } = {}
): PolicyStore {
  return {
    id: makePolicyId(parentAccountId, address),
    parentAccountId,
    chain: 'bitcoin',
    address,
    descriptor: `wsh(sortedmulti(2,xpubA/0/0,xpubB/0/0))`,
    role: 'signer',
  };
}

const stacksPolicy: PolicyStore = {
  id: makePolicyId(parentAccountIdA, 'SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1'),
  parentAccountId: parentAccountIdA,
  chain: 'stacks',
  address: 'SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1',
  publicKeys: ['03aa', '02bb'],
  threshold: 2,
  role: 'signer',
};

function seed(...policies: PolicyStore[]) {
  return policies.reduce(
    (state, policy) => reducer(state, userAddsPolicyAccount({ policy })),
    getInitialState()
  );
}

describe('policySlice', () => {
  test('adds a bitcoin policy', () => {
    const policy = makeBitcoinPolicy(parentAccountIdA);
    const result = reducer(getInitialState(), userAddsPolicyAccount({ policy }));

    expect(result.ids).toEqual([policy.id]);
    expect(result.entities[policy.id]).toEqual(policy);
  });

  test('adds a stacks policy', () => {
    const result = reducer(getInitialState(), userAddsPolicyAccount({ policy: stacksPolicy }));

    expect(result.entities[stacksPolicy.id]).toEqual(stacksPolicy);
  });

  test('does not store a name on the policy', () => {
    const policy = makeBitcoinPolicy(parentAccountIdA);
    const result = reducer(
      getInitialState(),
      userAddsPolicyAccount({ policy, name: 'Family vault' })
    );

    expect(result.entities[policy.id]).not.toHaveProperty('name');
  });

  test('is idempotent: re-adding the same (parent, address) replaces in place', () => {
    const policy = makeBitcoinPolicy(parentAccountIdA);
    const updated = { ...policy, descriptor: 'wsh(sortedmulti(2,xpubC/0/0,xpubD/0/0))' };
    let state = reducer(getInitialState(), userAddsPolicyAccount({ policy }));
    state = reducer(state, userAddsPolicyAccount({ policy: updated }));

    expect(state.ids).toHaveLength(1);
    expect(state.entities[policy.id]).toEqual(updated);
  });

  test('keeps separate rows for the same address under different parent accounts', () => {
    const policyA = makeBitcoinPolicy(parentAccountIdA);
    const policyB = makeBitcoinPolicy(parentAccountIdB);
    const state = seed(policyA, policyB);

    expect(state.ids).toHaveLength(2);
    expect(state.entities[policyA.id]).toBeDefined();
    expect(state.entities[policyB.id]).toBeDefined();
  });

  test('cascades removal of a wallet to its policies', () => {
    const policyA = makeBitcoinPolicy(parentAccountIdA);
    const policyB = makeBitcoinPolicy(parentAccountIdB);
    const state = reducer(seed(policyA, policyB), userRemovesWallet({ fingerprint: fingerprintA }));

    expect(state.ids).toEqual([policyB.id]);
  });

  test('is a no-op when removing a wallet with no policies', () => {
    const seeded = seed(makeBitcoinPolicy(parentAccountIdA));
    const result = reducer(seeded, userRemovesWallet({ fingerprint: '99999999' }));

    expect(result).toEqual(seeded);
  });

  test('clears all policies on wallet reset', () => {
    const seeded = seed(makeBitcoinPolicy(parentAccountIdA));
    const result = reducer(seeded, resetWallet());

    expect(result).toEqual(getInitialState());
  });
});
