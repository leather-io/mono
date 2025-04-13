import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useSettings } from '@/store/settings/settings';
import { createSelector } from '@reduxjs/toolkit';
import {
  ChainId,
  STACKS_MAINNET,
  STACKS_TESTNET,
  StacksNetwork,
  StacksNetworkName,
  TransactionVersion,
} from '@stacks/network';

import { getBtcSignerLibNetworkConfigByMode } from '@leather.io/bitcoin';
import {
  accountDisplayPreferencesKeyedByType,
  bitcoinUnitsKeyedByName,
} from '@leather.io/constants';
import {
  NetworkConfiguration,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';
import { whenStacksChainId } from '@leather.io/stacks';

import type { RootState } from '..';

function selectSettings(state: RootState) {
  return state.settings;
}

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

export const selectHapticsPreference = createSelector(
  selectSettings,
  state => state.hapticsPreference
);

export const selectSecurityLevelPreference = createSelector(
  selectSettings,
  state => state.securityLevelPreference
);

export const selectNotificationsPreference = createSelector(
  selectSettings,
  state => state.notificationsPreference
);

export const selectThemePreference = createSelector(selectSettings, state => state.themePreference);

export const selectLastActive = createSelector(selectSettings, state => state.lastActive);

export function usePrivacyMode() {
  const privacyMode = useSelector(selectPrivacyModePreference);
  return privacyMode === 'hidden';
}

function getNetworkFromChainId(chainId: number) {
  if (chainId === ChainId.Mainnet) return STACKS_MAINNET;
  if (chainId === ChainId.Testnet) return STACKS_TESTNET;
  throw new Error(`Unknown chain ID: ${chainId}`);
}

function getNetworkFromNetworkName(stacksNetworkName: StacksNetworkName) {
  if (stacksNetworkName === 'testnet')
    return defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.testnet4];
  if (stacksNetworkName === 'mainnet')
    return defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.mainnet];
  throw new Error('This network is currently not supported');
}

function getStacksNetworkFromNetworkConfig(networkConfig: NetworkConfiguration) {
  return {
    ...getNetworkFromChainId(networkConfig.chain.stacks.chainId),
    transactionVersion: whenStacksChainId(networkConfig.chain.stacks.chainId)({
      [ChainId.Mainnet]: TransactionVersion.Mainnet,
      [ChainId.Testnet]: TransactionVersion.Testnet,
    }),
    client: {
      baseUrl: networkConfig.chain.stacks.url,
    },
    chainId: networkConfig.chain.stacks.subnetChainId ?? networkConfig.chain.stacks.chainId,
    bnsLookupUrl: networkConfig.chain.stacks.url || '',
  };
}

export function getStacksNetworkFromName(stacksNetworkName: StacksNetworkName): StacksNetwork {
  const networkConfig = getNetworkFromNetworkName(stacksNetworkName);
  return getStacksNetworkFromNetworkConfig(networkConfig);
}

export function useNetworkPreferenceStacksNetwork(): StacksNetwork {
  const { networkPreference } = useSettings();

  return useMemo(() => getStacksNetworkFromNetworkConfig(networkPreference), [networkPreference]);
}

export function useNetworkPreferenceBitcoinScureLibNetworkConfig() {
  const { networkPreference } = useSettings();
  return getBtcSignerLibNetworkConfigByMode(networkPreference.chain.bitcoin.mode);
}
