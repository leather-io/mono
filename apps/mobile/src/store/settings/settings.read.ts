import { createSelector } from '@reduxjs/toolkit';

import {
  accountDisplayPreferencesKeyedByType,
  bitcoinUnitsKeyedByName,
} from '@leather.io/constants';
import { defaultNetworksKeyedById } from '@leather.io/models';

import type { RootState } from '..';

const selectSettings = (state: RootState) => state.settings;

export const selectAccountDisplayPreference = createSelector(
  selectSettings,
  state => accountDisplayPreferencesKeyedByType[state.accountDisplayPreference]
);

export const selectAnalyticsPreference = createSelector(
  selectSettings,
  state => state.analyticsPreference
);

export const selectBitcoinUnitPreference = createSelector(
  selectSettings,
  state => bitcoinUnitsKeyedByName[state.bitcoinUnitPreference]
);

export const selectCurrencyPreference = createSelector(
  selectSettings,
  state => state.fiatCurrencyPreference
);

export const selectEmailAddressPreference = createSelector(
  selectSettings,
  state => state.emailAddressPreference
);

export const selectNetworkPreference = createSelector(
  selectSettings,
  state => defaultNetworksKeyedById[state.networkPreference]
);

export const selectSecurityLevelPreference = createSelector(
  selectSettings,
  state => state.securityLevelPreference
);

export const selectThemePreference = createSelector(selectSettings, state => state.themePreference);
