import { useSelector } from 'react-redux';

import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
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

export const selectSecurityLevelPreference = createSelector(
  selectSettings,
  state => state.securityLevelPreference
);

export const selectThemePreference = createSelector(selectSettings, state => state.themePreference);

export const selectLastActive = createSelector(selectSettings, state => state.lastActive);

export function usePrivacyMode() {
  const privacyMode = useSelector(selectPrivacyModePreference);
  return privacyMode === 'hidden';
}

// TODO: Needs BNS name support
export function useAccountDisplayAddress(fingerprint: string, accountIndex: number) {
  const { accountDisplayPreference } = useSettings();

  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const taprootPayer = taproot.derivePayer({ addressIndex: 0 });
  const nativeSegwitPayer = nativeSegwit.derivePayer({ addressIndex: 0 });

  const stxAddress = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';

  switch (accountDisplayPreference.type) {
    case 'native-segwit':
      return nativeSegwitPayer.address;
    case 'taproot':
      return taprootPayer.address;
    case 'bns':
      return '';
    case 'stacks':
    default:
      return stxAddress;
  }
}
