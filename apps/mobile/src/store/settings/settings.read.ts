import { useSelector } from 'react-redux';

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

export const selectPrivacyModePreference = createSelector(
  selectSettings,
  state => state.privacyModePreference
);

export const selectAppSecurityLevelPreference = createSelector(
  selectSettings,
  state => state.appSecurityLevelPreference
);

export const selectWalletSecurityLevelPreference = createSelector(
  selectSettings,
  state => state.walletSecurityLevelPreference
);

export const selectThemePreference = createSelector(selectSettings, state => state.themePreference);

export function usePrivacyMode() {
  const privacyMode = useSelector(selectPrivacyModePreference);
  return privacyMode === 'hidden';
}
