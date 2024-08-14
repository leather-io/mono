import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { whenTheme } from '@/utils/when-theme';
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import {
  DefaultNetworkConfigurations,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';

import type { RootState } from '..';
import { handleAppResetWithState } from '../global-action';
import { useAppDispatch } from '../utils';

export type ThemeStore = 'light' | 'dark' | 'system';
export type Theme = Exclude<ThemeStore, 'system'>;

export type WalletSecurityLevel = 'undefined' | 'secure' | 'insecure';

export interface SettingsState {
  theme: ThemeStore;
  network: DefaultNetworkConfigurations;
  createdOn: string;
  walletSecurityLevel: WalletSecurityLevel;
}

const initialState: SettingsState = {
  theme: 'light',
  network: WalletDefaultNetworkConfigurationIds.mainnet,
  createdOn: new Date().toISOString(),
  walletSecurityLevel: 'undefined',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
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

const selectTheme = createSelector(selectSettings, state => state.theme);

export const selectNetwork = createSelector(
  selectSettings,
  state => defaultNetworksKeyedById[state.network]
);

export const selectWalletSecurityLevel = createSelector(
  selectSettings,
  state => state.walletSecurityLevel
);

export const { userChangedTheme, userChangedNetwork, userChangedWalletSecurityLevel } =
  settingsSlice.actions;

export function useSettings() {
  const dispatch = useAppDispatch();
  const network = useSelector(selectNetwork);
  const walletSecurityLevel = useSelector(selectWalletSecurityLevel);
  const systemTheme = useColorScheme();
  const themeStore = useSelector(selectTheme);
  const theme = (themeStore === 'system' ? systemTheme : themeStore) ?? 'light';

  return {
    theme,
    whenTheme: whenTheme(theme),
    changeAppTheme(theme: ThemeStore) {
      dispatch(userChangedTheme(theme));
    },
    toggleTheme() {
      dispatch(theme === 'light' ? userChangedTheme('dark') : userChangedTheme('light'));
    },
    network,
    changeAppNetwork(network: DefaultNetworkConfigurations) {
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
