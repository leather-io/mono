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
  PrivacyModePreference,
  SecurityLevelPreference,
  ThemePreference,
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
    userChangedSecurityLevelPreference(state, action: PayloadAction<SecurityLevelPreference>) {
      state.securityLevelPreference = action.payload;
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
  userChangedSecurityLevelPreference,
  userChangedThemePreference,
} = settingsSlice.actions;
