import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { whenTheme } from '@/utils/when-theme';

import {
  AccountDisplayPreference,
  AnalyticsPreference,
  BitcoinUnit,
  DefaultNetworkConfigurations,
  EmailAddress,
  FiatCurrency,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';

import { useAppDispatch } from '../utils';
import {
  selectAccountDisplayPreference,
  selectAnalyticsPreference,
  selectAppSecurityLevelPreference,
  selectBitcoinUnitPreference,
  selectCurrencyPreference,
  selectEmailAddressPreference,
  selectNetworkPreference,
  selectPrivacyModePreference,
  selectThemePreference,
  selectWalletSecurityLevelPreference,
} from './settings.read';
import {
  userChangedAccountDisplayPreference,
  userChangedAnalyticsPreference,
  userChangedAppSecurityLevelPreference,
  userChangedBitcoinUnitPreference,
  userChangedEmailAddressPreference,
  userChangedFiatCurrencyPreference,
  userChangedNetworkPreference,
  userChangedPrivacyModePreference,
  userChangedThemePreference,
  userChangedWalletSecurityLevelPreference,
} from './settings.write';

export const defaultNetworkPreferences = ['mainnet', 'testnet', 'signet'] as const;
export const defaultThemePreferences = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof defaultThemePreferences)[number];
export type Theme = Exclude<ThemePreference, 'system'>;
export type AppSecurityLevelPreference = 'insecure' | 'secure';
export type WalletSecurityLevelPreference = 'insecure' | 'secure' | 'not-selected';
export type PrivacyModePreference = 'hidden' | 'visible';

export interface SettingsState {
  accountDisplayPreference: AccountDisplayPreference;
  analyticsPreference: AnalyticsPreference;
  bitcoinUnitPreference: BitcoinUnit;
  createdOn: string;
  emailAddressPreference: EmailAddress;
  fiatCurrencyPreference: FiatCurrency;
  networkPreference: DefaultNetworkConfigurations;
  privacyModePreference: PrivacyModePreference;
  themePreference: ThemePreference;
  appSecurityLevelPreference: AppSecurityLevelPreference;
  walletSecurityLevelPreference: WalletSecurityLevelPreference;
}

export const initialState: SettingsState = {
  accountDisplayPreference: 'native-segwit',
  analyticsPreference: 'consent-given',
  bitcoinUnitPreference: 'bitcoin',
  createdOn: new Date().toISOString(),
  emailAddressPreference: '',
  fiatCurrencyPreference: 'USD',
  networkPreference: WalletDefaultNetworkConfigurationIds.mainnet,
  privacyModePreference: 'visible',
  appSecurityLevelPreference: 'insecure',
  walletSecurityLevelPreference: 'not-selected',
  themePreference: 'system',
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
  const appSecurityLevelPreference = useSelector(selectAppSecurityLevelPreference);
  const walletSecurityLevelPreference = useSelector(selectWalletSecurityLevelPreference);
  const themePreference = useSelector(selectThemePreference);

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
    appSecurityLevelPreference,
    walletSecurityLevelPreference,
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
    changeAppSecurityLevelPreference(level: AppSecurityLevelPreference) {
      dispatch(userChangedAppSecurityLevelPreference(level));
    },
    changeWalletSecurityLevelPreference(level: AppSecurityLevelPreference) {
      dispatch(userChangedWalletSecurityLevelPreference(level));
    },
    changeThemePreference(theme: ThemePreference) {
      dispatch(userChangedThemePreference(theme));
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
