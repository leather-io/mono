import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import {
  AccountDisplayPreference,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  FiatCurrency,
} from '@leather.io/models';

import { handleAppResetWithState } from '../global-action';
import {
  AppSecurityLevelPreference,
  PrivacyModePreference,
  ThemePreference,
  WalletSecurityLevelPreference,
  initialState,
} from './settings';

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    userChangedAccountDisplayPreference(state, action: PayloadAction<AccountDisplayPreference>) {
      state.accountDisplayPreference = action.payload;
    },
    userChangedAnalyticsPreference(state, action: PayloadAction<AnalyticsPreference>) {
      state.analyticsPreference = action.payload;
    },
    userChangedBitcoinUnitPreference(state, action: PayloadAction<BitcoinUnit>) {
      state.bitcoinUnitPreference = action.payload;
    },
    userChangedEmailAddressPreference(state, action: PayloadAction<string>) {
      state.emailAddressPreference = action.payload;
    },
    userChangedFiatCurrencyPreference(state, action: PayloadAction<FiatCurrency>) {
      state.fiatCurrencyPreference = action.payload;
    },
    userChangedNetworkPreference(state, action: PayloadAction<DefaultNetworkConfigurations>) {
      state.networkPreference = action.payload;
    },
    userChangedPrivacyModePreference(state, action: PayloadAction<PrivacyModePreference>) {
      state.privacyModePreference = action.payload;
    },
    userChangedAppSecurityLevelPreference(
      state,
      action: PayloadAction<AppSecurityLevelPreference>
    ) {
      state.appSecurityLevelPreference = action.payload;
    },
    userChangedWalletSecurityLevelPreference(
      state,
      action: PayloadAction<WalletSecurityLevelPreference>
    ) {
      state.walletSecurityLevelPreference = action.payload;
    },
    userChangedThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
  },
  extraReducers: builder => builder.addCase(...handleAppResetWithState(initialState)),
});

export const {
  userChangedAccountDisplayPreference,
  userChangedAnalyticsPreference,
  userChangedBitcoinUnitPreference,
  userChangedEmailAddressPreference,
  userChangedFiatCurrencyPreference,
  userChangedNetworkPreference,
  userChangedPrivacyModePreference,
  userChangedAppSecurityLevelPreference,
  userChangedWalletSecurityLevelPreference,
  userChangedThemePreference,
} = settingsSlice.actions;
