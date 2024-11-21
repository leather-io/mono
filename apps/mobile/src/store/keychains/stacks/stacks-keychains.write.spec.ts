import { userAddsAccount } from '@/store/accounts/accounts.write';
import { userAddsWallet, userRemovesWallet } from '@/store/global-action';
import { SoftwareWalletStore } from '@/store/wallets/utils';
import { describe, expect, it } from 'vitest';

import { stacksKeychainSlice } from './stacks-keychains.write';

const mockKeyChainA = { descriptor: 'm/44/5757/0/0/0' };
const mockKeyChainB = { descriptor: 'm/44/5757/0/0/1' };

const mockWallet: SoftwareWalletStore = {
  type: 'software',
  fingerprint: 'some-fingerprint',
  createdOn: '2023-10-01',
  name: 'My Wallet',
};

describe('stacksKeychainSlice', () => {
  const initialState = stacksKeychainSlice.getInitialState();

  describe('userAddsWallet', () => {
    it('adds stacks keychains when wallet is added', () => {
      const nextState = stacksKeychainSlice.reducer(
        initialState,
        userAddsWallet({
          wallet: mockWallet,
          withKeychains: { stacks: [mockKeyChainA, mockKeyChainB], bitcoin: [] },
        })
      );

      expect(Object.keys(nextState.entities)).toHaveLength(2);
      expect(nextState.ids).toEqual(['m/44/5757/0/0/0', 'm/44/5757/0/0/1']);
    });

    it('handles empty stacks keychains', () => {
      const nextState = stacksKeychainSlice.reducer(
        initialState,
        userAddsWallet({
          wallet: mockWallet,
          withKeychains: { stacks: [], bitcoin: [] },
        })
      );

      expect(nextState).toEqual(initialState);
    });
  });

  describe('userAddsAccount', () => {
    it('adds stacks keychains when account is added', () => {
      const nextState = stacksKeychainSlice.reducer(
        initialState,
        userAddsAccount({
          account: { id: '2' },
          withKeychains: { stacks: [mockKeyChainB], bitcoin: [] },
        })
      );

      expect(Object.keys(nextState.entities)).toHaveLength(1);
      expect(nextState.ids).toEqual(['m/44/5757/0/0/1']);
    });

    it('handles undefined keychains', () => {
      const nextState = stacksKeychainSlice.reducer(
        initialState,
        userAddsAccount({
          account: { id: '1' },
          withKeychains: { stacks: [], bitcoin: [] },
        })
      );

      expect(nextState).toEqual(initialState);
    });
  });

  describe('userRemovesWallet', () => {
    it('removes stacks keychains when wallet is removed', () => {
      // First add some keychains
      const stateWithKeychains = stacksKeychainSlice.reducer(
        initialState,
        userAddsWallet({
          wallet: mockWallet,
          withKeychains: {
            stacks: [{ descriptor: 'm/44/5757/0/0/0' }, { descriptor: 'm/44/5757/0/0/1' }],
            bitcoin: [],
          },
        })
      );

      // Then remove them
      const nextState = stacksKeychainSlice.reducer(
        stateWithKeychains,
        userRemovesWallet({
          fingerprint: mockWallet.fingerprint,
        })
      );

      expect(nextState.ids).toHaveLength(0);
      expect(nextState.entities).toEqual({});
    });
  });
});
