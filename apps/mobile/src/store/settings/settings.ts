import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { whenTheme } from '@/utils/when-theme';

import {
  AccountDisplayPreference,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  FiatCurrency,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';

import { useAppDispatch } from '../utils';
import {
  selectAccountDisplayPreference,
  selectAnalyticsPreference,
  selectBitcoinUnitPreference,
  selectCurrencyPreference,
  selectEmailAddressPreference,
  selectLastActive,
  selectNetworkPreference,
  selectPrivacyModePreference,
  selectSecurityLevelPreference,
  selectThemePreference,
} from './settings.read';
import {
  userChangedAccountDisplayPreference,
  userChangedAnalyticsPreference,
  userChangedBitcoinUnitPreference,
  userChangedEmailAddressPreference,
  userChangedFiatCurrencyPreference,
  userChangedLastActive,
  userChangedNetworkPreference,
  userChangedPrivacyModePreference,
  userChangedSecurityLevelPreference,
  userChangedThemePreference,
} from './settings.write';
import {
  LastActiveTimestamp,
  PrivacyModePreference,
  SecurityLevelPreference,
  SettingsState,
  ThemePreference,
} from './utils';

export const initialState: SettingsState = {
  accountDisplayPreference: 'native-segwit',
  analyticsPreference: 'consent-given',
  bitcoinUnitPreference: 'bitcoin',
  createdOn: new Date().toISOString(),
  emailAddressPreference: '',
  fiatCurrencyPreference: 'USD',
  networkPreference: WalletDefaultNetworkConfigurationIds.mainnet,
  privacyModePreference: 'visible',
  securityLevelPreference: 'not-selected',
  themePreference: 'system',
  lastActive: null,
};

export function useSettings() {
  const dispatch = useAppDispatch();
  const systemTheme = useColorScheme();

  const accountDisplayPreference = useSelector(selectAccountDisplayPreference);
  const analyticsPreference = useSelector(selectAnalyticsPreference);
  const bitcoinUnitPreference = useSelector(selectBitcoinUnitPreference);
  const emailAddressPreference = useSelector(selectEmailAddressPreference);
  const fiatCurrencyPreference = useSelector(selectCurrencyPreference);
  const privacyModePreference = useSelector(selectPrivacyModePreference);
  const networkPreference = useSelector(selectNetworkPreference);
  const securityLevelPreference = useSelector(selectSecurityLevelPreference);
  const themePreference = useSelector(selectThemePreference);
  const lastActive = useSelector(selectLastActive);

  const themeDerivedFromThemePreference =
    (themePreference === 'system' ? systemTheme : themePreference) ?? 'light';

  return {
    accountDisplayPreference,
    analyticsPreference,
    bitcoinUnitPreference,
    emailAddressPreference,
    fiatCurrencyPreference,
    networkPreference,
    privacyModePreference,
    themeDerivedFromThemePreference,
    themePreference,
    securityLevelPreference,
    lastActive,
    whenTheme: whenTheme(themeDerivedFromThemePreference),
    changeAccountDisplayPreference(type: AccountDisplayPreference) {
      dispatch(userChangedAccountDisplayPreference(type));
    },
    changeAnalyticsPreference(pref: AnalyticsPreference) {
      dispatch(userChangedAnalyticsPreference(pref));
    },
    changeBitcoinUnitPreference(unit: BitcoinUnit) {
      dispatch(userChangedBitcoinUnitPreference(unit));
    },
    changeEmailAddressPreference(address: string) {
      dispatch(userChangedEmailAddressPreference(address));
    },
    changeFiatCurrencyPreference(unit: FiatCurrency) {
      dispatch(userChangedFiatCurrencyPreference(unit));
    },
    changeNetworkPreference(network: DefaultNetworkConfigurations) {
      dispatch(userChangedNetworkPreference(network));
    },
    changePrivacyModePreference(mode: PrivacyModePreference) {
      dispatch(userChangedPrivacyModePreference(mode));
    },
    changeSecurityLevelPreference(level: SecurityLevelPreference) {
      dispatch(userChangedSecurityLevelPreference(level));
    },
    changeThemePreference(theme: ThemePreference) {
      dispatch(userChangedThemePreference(theme));
    },
    userLeavesApp(timestamp: LastActiveTimestamp) {
      dispatch(userChangedLastActive(timestamp));
    },

    // TODO: Remove when live, debug only
    toggleNetwork() {
      dispatch(
        networkPreference.chain.bitcoin.bitcoinNetwork === 'mainnet'
          ? userChangedNetworkPreference('testnet')
          : userChangedNetworkPreference('mainnet')
      );
    },
    toggleTheme() {
      dispatch(
        themeDerivedFromThemePreference === 'light'
          ? userChangedThemePreference('dark')
          : userChangedThemePreference('light')
      );
    },
  };
}
