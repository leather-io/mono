import { AvailableLanguageCode } from '@/i18n/languages';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import {
  AccountDisplayPreference,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  QuoteCurrency,
} from '@leather.io/models';
import { handleAppResetWithState } from '@leather.io/state';
import { userAddsWallet } from '@leather.io/state/wallet';
import { SerializedCryptoAssetId } from '@leather.io/utils';

import { initialState } from './settings';
import { handleSettingsRehydration } from './settings-rehydration';
import {
  CurrentAccount,
  HapticsPreference,
  LanguagePreferenceSource,
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
    userChangedQuoteCurrencyPreference(state, action: PayloadAction<QuoteCurrency>) {
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
    userChangedLanguagePreference(state, action: PayloadAction<AvailableLanguageCode>) {
      state.languagePreference = action.payload;
    },
    userChangedLanguagePreferenceSource(state, action: PayloadAction<LanguagePreferenceSource>) {
      state.languagePreferenceSource = action.payload;
    },
    userChangedAssetVisibility(
      state,
      action: PayloadAction<{
        assetId: SerializedCryptoAssetId;
        value: boolean;
      }>
    ) {
      state.assetVisibility = {
        ...state.assetVisibility,
        [action.payload.assetId]: action.payload.value,
      };
    },
    userChangedCurrentAccount(state, action: PayloadAction<{ account: CurrentAccount }>) {
      state.currentAccount = action.payload.account;
    },
  },
  extraReducers: builder => {
    builder.addCase(REHYDRATE, handleSettingsRehydration);
    builder.addCase(userAddsWallet, (state, action) => {
      return {
        ...state,
        currentAccount: {
          fingerprint: action.payload.wallet.fingerprint,
          accountIndex: 0,
        },
      };
    });
    builder.addCase(...handleAppResetWithState(initialState));
  },
});

export const {
  userChangedAccountDisplayPreference,
  userChangedAnalyticsPreference,
  userChangedBitcoinUnitPreference,
  userChangedEmailAddressPreference,
  userChangedQuoteCurrencyPreference,
  userChangedNetworkPreference,
  userChangedPrivacyModePreference,
  userChangedHapticsPreference,
  userChangedSecurityLevelPreference,
  userChangedThemePreference,
  userChangedLastActive,
  userChangedNotificationPreference,
  userChangedLanguagePreference,
  userChangedLanguagePreferenceSource,
  userChangedAssetVisibility,
  userChangedCurrentAccount,
} = settingsSlice.actions;
