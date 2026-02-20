import { describe, expect, it } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { userAddsAccount } from '@leather.io/state/keychains';
import { userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';
import { TEST_FINGERPRINT } from '@leather.io/test-config';

import {
  accountsSlice,
  userRenamesAccount,
  userTogglesHideAccount,
  userUpdatesAccountIcon,
} from './accounts.write';

const reducer = accountsSlice.reducer;
const initialState = reducer(undefined, { type: '@@INIT' });

function stateWithWallet(fingerprint: string) {
  return reducer(
    initialState,
    userAddsWallet({
      wallet: { fingerprint, type: 'software', createdOn: null },
      accountKeychains: [],
    })
  );
}

describe('accounts slice', () => {
  describe(userAddsWallet.type, () => {
    it('creates first account with fingerprint/0 id', () => {
      const state = reducer(
        initialState,
        userAddsWallet({
          wallet: { fingerprint: TEST_FINGERPRINT, type: 'software', createdOn: null },
          accountKeychains: [],
        })
      );

      const expectedId = makeAccountIdentifer(TEST_FINGERPRINT, 0);
      expect(state.ids).toContain(expectedId);
      expect(state.entities[expectedId]).toBeDefined();
      expect(state.entities[expectedId]?.id).toBe(expectedId);
    });
  });

  describe(userRemovesWallet.type, () => {
    it('removes all accounts matching fingerprint', () => {
      let state = reducer(
        initialState,
        userAddsWallet({
          wallet: { fingerprint: TEST_FINGERPRINT, type: 'software', createdOn: null },
          accountKeychains: [],
        })
      );

      const secondAccountId = makeAccountIdentifer(TEST_FINGERPRINT, 1);
      state = reducer(
        state,
        userAddsAccount({ account: { id: secondAccountId }, accountKeychains: [] })
      );

      expect(state.ids).toHaveLength(2);

      state = reducer(state, userRemovesWallet({ fingerprint: TEST_FINGERPRINT }));
      expect(state.ids).toHaveLength(0);
    });

    it('does not remove accounts from other wallets', () => {
      const otherFingerprint = 'other123';
      let state = reducer(
        initialState,
        userAddsWallet({
          wallet: { fingerprint: TEST_FINGERPRINT, type: 'software', createdOn: null },
          accountKeychains: [],
        })
      );
      state = reducer(
        state,
        userAddsWallet({
          wallet: { fingerprint: otherFingerprint, type: 'software', createdOn: null },
          accountKeychains: [],
        })
      );

      expect(state.ids).toHaveLength(2);

      state = reducer(state, userRemovesWallet({ fingerprint: TEST_FINGERPRINT }));
      expect(state.ids).toHaveLength(1);
      expect(state.ids[0]).toBe(makeAccountIdentifer(otherFingerprint, 0));
    });
  });

  describe(userAddsAccount.type, () => {
    it('adds account with given id', () => {
      const state = stateWithWallet(TEST_FINGERPRINT);
      const newAccountId = makeAccountIdentifer(TEST_FINGERPRINT, 1);

      const nextState = reducer(
        state,
        userAddsAccount({ account: { id: newAccountId }, accountKeychains: [] })
      );

      expect(nextState.ids).toContain(newAccountId);
      expect(nextState.entities[newAccountId]?.id).toBe(newAccountId);
    });
  });

  describe(userTogglesHideAccount.type, () => {
    it('sets status to active when status is undefined', () => {
      const state = stateWithWallet(TEST_FINGERPRINT);
      const accountId = makeAccountIdentifer(TEST_FINGERPRINT, 0);
      expect(state.entities[accountId]?.status).toBeUndefined();

      const nextState = reducer(state, userTogglesHideAccount({ accountId }));
      expect(nextState.entities[accountId]?.status).toBe('active');
    });

    it('toggles from active to hidden', () => {
      const state = stateWithWallet(TEST_FINGERPRINT);
      const accountId = makeAccountIdentifer(TEST_FINGERPRINT, 0);

      const activeState = reducer(state, userTogglesHideAccount({ accountId }));
      expect(activeState.entities[accountId]?.status).toBe('active');

      const hiddenState = reducer(activeState, userTogglesHideAccount({ accountId }));
      expect(hiddenState.entities[accountId]?.status).toBe('hidden');
    });

    it('toggles from hidden back to active', () => {
      const state = stateWithWallet(TEST_FINGERPRINT);
      const accountId = makeAccountIdentifer(TEST_FINGERPRINT, 0);

      const activeState = reducer(state, userTogglesHideAccount({ accountId }));
      const hiddenState = reducer(activeState, userTogglesHideAccount({ accountId }));
      const backToActive = reducer(hiddenState, userTogglesHideAccount({ accountId }));
      expect(backToActive.entities[accountId]?.status).toBe('active');
    });
  });

  describe(userRenamesAccount.type, () => {
    it('updates account name', () => {
      const state = stateWithWallet(TEST_FINGERPRINT);
      const accountId = makeAccountIdentifer(TEST_FINGERPRINT, 0);

      const nextState = reducer(state, userRenamesAccount({ accountId, name: 'Savings' }));
      expect(nextState.entities[accountId]?.name).toBe('Savings');
    });
  });

  describe(userUpdatesAccountIcon.type, () => {
    it('updates account icon', () => {
      const state = stateWithWallet(TEST_FINGERPRINT);
      const accountId = makeAccountIdentifer(TEST_FINGERPRINT, 0);

      const nextState = reducer(
        state,
        userUpdatesAccountIcon({
          fingerprint: TEST_FINGERPRINT,
          accountIndex: 0,
          icon: 'rocket',
        })
      );
      expect(nextState.entities[accountId]?.icon).toBe('rocket');
    });
  });
});
