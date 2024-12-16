import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { createSelector } from '@reduxjs/toolkit';
import {
  ChainId,
  STACKS_MAINNET,
  STACKS_TESTNET,
  StacksNetwork,
  TransactionVersion,
} from '@stacks/network';

import { getBtcSignerLibNetworkConfigByMode } from '@leather.io/bitcoin';
import {
  accountDisplayPreferencesKeyedByType,
  bitcoinUnitsKeyedByName,
} from '@leather.io/constants';
import { defaultNetworksKeyedById } from '@leather.io/models';
import { whenStacksChainId } from '@leather.io/stacks';
import { truncateMiddle } from '@leather.io/utils';

import type { RootState } from '..';
import { useAccountDisplayName } from '../../hooks/use-account-display-name';

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

export function useAccountDisplayAddress(fingerprint: string, accountIndex: number) {
  const { accountDisplayPreference } = useSettings();

  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const taprootPayer = taproot.derivePayer({ addressIndex: 0 });
  const nativeSegwitPayer = nativeSegwit.derivePayer({ addressIndex: 0 });

  const stxAddress = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';

  const { data: bnsName } = useAccountDisplayName({
    address: stxAddress,
  });

  switch (accountDisplayPreference.type) {
    case 'native-segwit':
      return truncateMiddle(nativeSegwitPayer.address);
    case 'taproot':
      return truncateMiddle(taprootPayer.address);
    case 'bns':
      return bnsName;
    case 'stacks':
    default:
      return truncateMiddle(stxAddress);
  }
}

export function useNetworkPreferenceStacksNetwork(): StacksNetwork {
  const { networkPreference } = useSettings();

  function getNetworkFromChainId(chainId: number) {
    if (chainId === ChainId.Mainnet) return STACKS_MAINNET;
    if (chainId === ChainId.Testnet) return STACKS_TESTNET;
    throw new Error(`Unknown chain ID: ${chainId}`);
  }

  return useMemo(
    () => ({
      ...getNetworkFromChainId(networkPreference.chain.stacks.chainId),
      transactionVersion: whenStacksChainId(networkPreference.chain.stacks.chainId)({
        [ChainId.Mainnet]: TransactionVersion.Mainnet,
        [ChainId.Testnet]: TransactionVersion.Testnet,
      }),
      chainId:
        networkPreference.chain.stacks.subnetChainId ?? networkPreference.chain.stacks.chainId,
      bnsLookupUrl: networkPreference.chain.stacks.url || '',
    }),
    [networkPreference]
  );
}

export function useNetworkPreferenceBitcoinScureLibNetworkConfig() {
  const { networkPreference } = useSettings();
  return getBtcSignerLibNetworkConfigByMode(networkPreference.chain.bitcoin.mode);
}
