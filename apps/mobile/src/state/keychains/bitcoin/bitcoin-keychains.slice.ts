import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { userAddsAccount } from '@/state/accounts/accounts.slice';
import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '@/state/global-action';
import { selectNetwork } from '@/state/settings/settings.slice';
import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import memoize from 'just-memoize';

import {
  bitcoinNetworkModeToCoreNetworkMode,
  deriveNativeSegWitReceiveAddressIndex,
  deriveTaprootReceiveAddressIndex,
  extractExtendedPublicKeyFromPolicy,
  inferNetworkFromPath,
  inferPaymentTypeFromPath,
} from '@leather.io/bitcoin';
import {
  extractDerivationPathFromDescriptor,
  extractFingerprintFromDescriptor,
  extractKeyOriginPathFromDescriptor,
} from '@leather.io/crypto';

import type { RootState } from '../..';
import { handleEntityActionWith } from '../../utils';
import { descriptorKeychainSelectors, filterKeychainsToRemove } from '../keychains';

export interface BitcoinKeychainStore {
  descriptor: string;
}
const adapter = createEntityAdapter<BitcoinKeychainStore, string>({
  selectId: keychain => extractKeyOriginPathFromDescriptor(keychain.descriptor),
});

const initialState = adapter.getInitialState();

export const bitcoinKeychainSlice = createSlice({
  name: 'bitcoin',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(
        userAddsWallet,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.bitcoin)
      )

      .addCase(
        userAddsAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.bitcoin)
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(adapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});

export const bitcoinKeychainSelectors = adapter.getSelectors(
  (state: RootState) => state.keychains.bitcoin
);

function initializeBitcoinKeychain(descriptor: string) {
  const derivationFn =
    inferPaymentTypeFromPath(extractDerivationPathFromDescriptor(descriptor)) === 'p2wpkh'
      ? deriveNativeSegWitReceiveAddressIndex
      : deriveTaprootReceiveAddressIndex;

  const result = {
    descriptor,
    fingerprint: extractFingerprintFromDescriptor(descriptor),
    ...derivationFn({
      xpub: extractExtendedPublicKeyFromPolicy(descriptor),
      network: inferNetworkFromPath(extractKeyOriginPathFromDescriptor(descriptor)),
    }),
  };
  return result;
}

const memoizedInitalizeBitcoinKeychain = memoize(initializeBitcoinKeychain);

const bitcoinKeychainList = createSelector(
  bitcoinKeychainSelectors.selectAll,
  selectNetwork,
  (accounts, network) =>
    accounts
      .filter(
        account =>
          inferNetworkFromPath(extractKeyOriginPathFromDescriptor(account.descriptor)) ===
          bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.bitcoinNetwork)
      )
      .map(account => memoizedInitalizeBitcoinKeychain(account.descriptor))
);

export function useBitcoinKeychains() {
  const list = useSelector(bitcoinKeychainList);
  return useMemo(() => descriptorKeychainSelectors(list), [list]);
}
