import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import {
  AccountDisplayPreference,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  QuoteCurrency,
} from '@leather.io/models';

import { handleAppResetWithState } from '../global-action';
import { initialState } from './settings';
import {
  HapticsPreference,
  LastActiveTimestamp,
  NotificationsPreference,
  PrivacyModePreference,
  SecurityLevelPreference,
  ThemePreference,
} from './utils';

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
    userChangedFiatCurrencyPreference(state, action: PayloadAction<QuoteCurrency>) {
      state.fiatCurrencyPreference = action.payload;
    },
    userChangedNetworkPreference(state, action: PayloadAction<DefaultNetworkConfigurations>) {
      state.networkPreference = action.payload;
    },
    userChangedPrivacyModePreference(state, action: PayloadAction<PrivacyModePreference>) {
      state.privacyModePreference = action.payload;
    },
    userChangedHapticsPreference(state, action: PayloadAction<HapticsPreference>) {
      state.hapticsPreference = action.payload;
    },
    userChangedSecurityLevelPreference(state, action: PayloadAction<SecurityLevelPreference>) {
      state.securityLevelPreference = action.payload;
    },
    userChangedThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
    userChangedLastActive(state, action: PayloadAction<LastActiveTimestamp>) {
      state.lastActive = action.payload;
    },
    userChangedNotificationPreference(state, action: PayloadAction<NotificationsPreference>) {
      state.notificationsPreference = action.payload;
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
  userChangedHapticsPreference,
  userChangedSecurityLevelPreference,
  userChangedThemePreference,
  userChangedLastActive,
  userChangedNotificationPreference,
} = settingsSlice.actions;
