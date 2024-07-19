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
}

const initialState: SettingsState = {
  theme: 'light',
  network: WalletDefaultNetworkConfigurationIds.mainnet,
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
  return {
    theme: useSelector(theme),
    changeAppTheme(theme: Theme) {
      dispatch(userChangedTheme(theme));
    },
    network: useSelector(selectNetwork),
    changeAppNetwork(network: DefaultNetworkConfigurations) {
      dispatch(userChangedNetwork(network));
    },
  };
}
