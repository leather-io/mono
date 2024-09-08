import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { whenTheme } from '@/utils/when-theme';
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import { bitcoinUnitsKeyedByName } from '@leather.io/constants';
import {
  BitcoinUnit,
  DefaultNetworkConfigurations,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';

import type { RootState } from '..';
import { handleAppResetWithState } from '../global-action';
import { useAppDispatch } from '../utils';

export const defaultNetworks = ['mainnet', 'testnet', 'signet'] as const;

export const defaultThemes = ['light', 'dark', 'system'] as const;
export type ThemeStore = (typeof defaultThemes)[number];
export type Theme = Exclude<ThemeStore, 'system'>;

export type WalletSecurityLevel = 'undefined' | 'secure' | 'insecure';

export interface SettingsState {
  bitcoinUnit: BitcoinUnit;
  createdOn: string;
  network: DefaultNetworkConfigurations;
  theme: ThemeStore;
  walletSecurityLevel: WalletSecurityLevel;
}

const initialState: SettingsState = {
  bitcoinUnit: 'bitcoin',
  createdOn: new Date().toISOString(),
  network: WalletDefaultNetworkConfigurationIds.mainnet,
  theme: 'system',
  walletSecurityLevel: 'undefined',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    userChangedBitcoinUnit(state, action: PayloadAction<BitcoinUnit>) {
      state.bitcoinUnit = action.payload;
    },
    userChangedTheme(state, action: PayloadAction<ThemeStore>) {
      state.theme = action.payload;
    },
    userChangedNetwork(state, action: PayloadAction<DefaultNetworkConfigurations>) {
      state.network = action.payload;
    },
    userChangedWalletSecurityLevel(state, action: PayloadAction<WalletSecurityLevel>) {
      state.walletSecurityLevel = action.payload;
    },
  },
  extraReducers: builder => builder.addCase(...handleAppResetWithState(initialState)),
});

const selectSettings = (state: RootState) => state.settings;

export const selectBitcoinUnit = createSelector(
  selectSettings,
  state => bitcoinUnitsKeyedByName[state.bitcoinUnit]
);

const selectTheme = createSelector(selectSettings, state => state.theme);

export const selectNetwork = createSelector(
  selectSettings,
  state => defaultNetworksKeyedById[state.network]
);

export const selectWalletSecurityLevel = createSelector(
  selectSettings,
  state => state.walletSecurityLevel
);

export const {
  userChangedBitcoinUnit,
  userChangedTheme,
  userChangedNetwork,
  userChangedWalletSecurityLevel,
} = settingsSlice.actions;

export function useSettings() {
  const dispatch = useAppDispatch();
  const network = useSelector(selectNetwork);
  const walletSecurityLevel = useSelector(selectWalletSecurityLevel);
  const systemTheme = useColorScheme();
  const bitcoinUnit = useSelector(selectBitcoinUnit);
  const themeStore = useSelector(selectTheme);
  const theme = (themeStore === 'system' ? systemTheme : themeStore) ?? 'light';

  return {
    bitcoinUnit,
    theme,
    themeStore,
    whenTheme: whenTheme(theme),
    changeBitcoinUnit(unit: BitcoinUnit) {
      dispatch(userChangedBitcoinUnit(unit));
    },
    changeTheme(theme: ThemeStore) {
      dispatch(userChangedTheme(theme));
    },
    toggleTheme() {
      dispatch(theme === 'light' ? userChangedTheme('dark') : userChangedTheme('light'));
    },
    network,
    changeNetwork(network: DefaultNetworkConfigurations) {
      dispatch(userChangedNetwork(network));
    },
    // TODO: Remove when live, debug only
    toggleNetwork() {
      dispatch(
        network.chain.bitcoin.bitcoinNetwork === 'mainnet'
          ? userChangedNetwork('testnet')
          : userChangedNetwork('mainnet')
      );
    },
    walletSecurityLevel,
    changeWalletSecurityLevel(level: WalletSecurityLevel) {
      dispatch(userChangedWalletSecurityLevel(level));
    },
  };
}
