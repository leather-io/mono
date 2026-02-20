import { describe, expect, it, vi } from 'vitest';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';
import { userAddsWallet } from '@leather.io/state/wallet';
import { TEST_FINGERPRINT } from '@leather.io/test-config';

import {
  settingsSlice,
  userChangedAssetVisibility,
  userChangedBitcoinUnitPreference,
  userChangedCurrentAccount,
  userChangedNetworkPreference,
  userChangedPrivacyModePreference,
  userChangedThemePreference,
} from './settings.write';

vi.mock('./settings-rehydration', () => ({
  handleSettingsRehydration: vi.fn(state => state),
}));

const reducer = settingsSlice.reducer;
const initialState = reducer(undefined, { type: '@@INIT' });

describe('settings slice', () => {
  describe('initial state', () => {
    it('defaults to mainnet', () => {
      expect(initialState.networkPreference).toBe(WalletDefaultNetworkConfigurationIds.mainnet);
    });

    it('defaults to USD', () => {
      expect(initialState.fiatCurrencyPreference).toBe('USD');
    });

    it('defaults to visible privacy mode', () => {
      expect(initialState.privacyModePreference).toBe('visible');
    });

    it('defaults to enabled haptics', () => {
      expect(initialState.hapticsPreference).toBe('enabled');
    });

    it('defaults to system theme', () => {
      expect(initialState.themePreference).toBe('system');
    });

    it('defaults to bitcoin unit', () => {
      expect(initialState.bitcoinUnitPreference).toBe('bitcoin');
    });

    it('defaults to null current account', () => {
      expect(initialState.currentAccount).toBeNull();
    });

    it('defaults to native-segwit display', () => {
      expect(initialState.accountDisplayPreference).toBe('native-segwit');
    });

    it('defaults to empty asset visibility', () => {
      expect(initialState.assetVisibility).toEqual({});
    });
  });

  describe(userChangedNetworkPreference.type, () => {
    it('updates network preference', () => {
      const state = reducer(initialState, userChangedNetworkPreference('testnet4'));
      expect(state.networkPreference).toBe('testnet4');
    });
  });

  describe(userChangedThemePreference.type, () => {
    it('updates theme preference', () => {
      const state = reducer(initialState, userChangedThemePreference('dark'));
      expect(state.themePreference).toBe('dark');
    });
  });

  describe(userChangedPrivacyModePreference.type, () => {
    it('updates privacy mode', () => {
      const state = reducer(initialState, userChangedPrivacyModePreference('hidden'));
      expect(state.privacyModePreference).toBe('hidden');
    });
  });

  describe(userChangedBitcoinUnitPreference.type, () => {
    it('updates bitcoin unit', () => {
      const state = reducer(initialState, userChangedBitcoinUnitPreference('satoshi'));
      expect(state.bitcoinUnitPreference).toBe('satoshi');
    });
  });

  describe(userChangedCurrentAccount.type, () => {
    it('sets current account', () => {
      const account = { fingerprint: TEST_FINGERPRINT, accountIndex: 0 };
      const state = reducer(initialState, userChangedCurrentAccount({ account }));
      expect(state.currentAccount).toEqual(account);
    });
  });

  describe(userChangedAssetVisibility.type, () => {
    it('sets asset visibility', () => {
      const state = reducer(
        initialState,
        userChangedAssetVisibility({ assetId: 'bitcoin|native', value: false })
      );
      expect(state.assetVisibility).toEqual({ 'bitcoin|native': false });
    });

    it('merges with existing asset visibility', () => {
      let state = reducer(
        initialState,
        userChangedAssetVisibility({ assetId: 'bitcoin|native', value: false })
      );
      state = reducer(
        state,
        userChangedAssetVisibility({ assetId: 'stacks|native', value: true })
      );
      expect(state.assetVisibility).toEqual({ 'bitcoin|native': false, 'stacks|native': true });
    });
  });

  describe(userAddsWallet.type, () => {
    it('sets currentAccount to fingerprint with accountIndex 0', () => {
      const state = reducer(
        initialState,
        userAddsWallet({
          wallet: { fingerprint: TEST_FINGERPRINT, type: 'software', createdOn: null },
          accountKeychains: [],
        })
      );

      expect(state.currentAccount).toEqual({
        fingerprint: TEST_FINGERPRINT,
        accountIndex: 0,
      });
    });
  });
});
