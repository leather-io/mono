import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { createSelector } from '@reduxjs/toolkit';
import { StacksNetwork } from '@stacks/network';
import { ChainID, TransactionVersion } from '@stacks/transactions';

import { getBtcSignerLibNetworkConfigByMode } from '@leather.io/bitcoin';
import {
  accountDisplayPreferencesKeyedByType,
  bitcoinUnitsKeyedByName,
} from '@leather.io/constants';
import { defaultNetworksKeyedById } from '@leather.io/models';
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

export function useNetworkPreferenceStacksNetwork(): StacksNetwork {
  const { networkPreference } = useSettings();

  return useMemo(() => {
    const stacksNetwork = new StacksNetwork({ url: networkPreference.chain.stacks.url });

    stacksNetwork.version = whenStacksChainId(networkPreference.chain.stacks.chainId)({
      [ChainID.Mainnet]: TransactionVersion.Mainnet,
      [ChainID.Testnet]: TransactionVersion.Testnet,
    });
    stacksNetwork.chainId =
      networkPreference.chain.stacks.subnetChainId ?? networkPreference.chain.stacks.chainId;
    stacksNetwork.bnsLookupUrl = networkPreference.chain.stacks.url || '';

    return stacksNetwork;
  }, [networkPreference]);
}

export function useNetworkPreferenceBitcoinScureLibNetworkConfig() {
  const { networkPreference } = useSettings();
  return getBtcSignerLibNetworkConfigByMode(networkPreference.chain.bitcoin.mode);
}
