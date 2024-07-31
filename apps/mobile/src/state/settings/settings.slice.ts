import { useSelector } from 'react-redux';

import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import {
  DefaultNetworkConfigurations,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';

import type { RootState } from '..';
import { handleAppResetWithState } from '../global-action';
import { useAppDispatch } from '../utils';

export type Theme = 'light' | 'dark' | 'system';

export interface SettingsState {
  theme: Theme;
  network: DefaultNetworkConfigurations;
  createdOn: string;
}

const initialState: SettingsState = {
  theme: 'light',
  network: WalletDefaultNetworkConfigurationIds.mainnet,
  createdOn: new Date().toISOString(),
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    userChangedTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    userChangedNetwork(state, action: PayloadAction<DefaultNetworkConfigurations>) {
      state.network = action.payload;
    },
  },
  extraReducers: builder => builder.addCase(...handleAppResetWithState(initialState)),
});

const settingsSelector = (state: RootState) => state.settings;

const theme = createSelector(settingsSelector, state => state.theme);

export const selectNetwork = createSelector(
  settingsSelector,
  state => defaultNetworksKeyedById[state.network]
);

export const { userChangedTheme, userChangedNetwork } = settingsSlice.actions;

export function useSettings() {
  const dispatch = useAppDispatch();
  const network = useSelector(selectNetwork);
  return {
    theme: useSelector(theme),
    changeAppTheme(theme: Theme) {
      dispatch(userChangedTheme(theme));
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
  };
}
