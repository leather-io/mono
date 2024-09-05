import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { userAddsAccount } from '@/store/accounts/accounts.write';
import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '@/store/global-action';
import { selectNetwork } from '@/store/settings/settings.write';
import { mnemonicStore } from '@/store/storage-persistors';
import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

import { decomposeDescriptor, extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';
import {
  createSignFnFromMnemonic,
  initalizeStacksSigner,
  stacksChainIdToCoreNetworkMode,
} from '@leather.io/stacks';

import type { RootState } from '../..';
import { handleEntityActionWith } from '../../utils';
import {
  descriptorKeychainSelectors,
  filterKeychainsByStacksAccount,
  filterKeychainsToRemove,
} from '../keychains';

export interface StacksKeychainStore {
  // Stacks doesn't use the concept of BIP-380 Descriptors the same way Bitcoin
  // does. However, we need to store the same data. Reusing this structure
  // provides a consistent interface between keychain stores. The `descriptor`
  // field here is used to store the derivation path and public key, rather than
  // extended public key (xpub) used in Bitcoin store.
  descriptor: string;
}
const adapter = createEntityAdapter<StacksKeychainStore, string>({
  selectId: keychain => extractKeyOriginPathFromDescriptor(keychain.descriptor),
});

const initialState = adapter.getInitialState();

export const stacksKeychainSlice = createSlice({
  name: 'stacks',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(
        userAddsWallet,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.stacks ?? [])
      )

      .addCase(
        userAddsAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains?.stacks ?? [])
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(adapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});

export const stacksKeychainSelectors = adapter.getSelectors(
  (state: RootState) => state.keychains.stacks
);

function createSignFnFromBiometricMnemonicStore(descriptor: string) {
  const { keyOrigin, fingerprint } = decomposeDescriptor(descriptor);
  return createSignFnFromMnemonic(keyOrigin, () => mnemonicStore(fingerprint).getMnemonic());
}

const stacksKeychainList = createSelector(
  stacksKeychainSelectors.selectAll,
  selectNetwork,
  (accounts, network) =>
    accounts.map(account =>
      initalizeStacksSigner({
        descriptor: account.descriptor,
        network: stacksChainIdToCoreNetworkMode(network.chain.stacks.chainId),
        signFn: createSignFnFromBiometricMnemonicStore(account.descriptor),
      })
    )
);

export function useStacksKeychains() {
  const list = useSelector(stacksKeychainList);
  return useMemo(
    () => ({ ...descriptorKeychainSelectors(list, filterKeychainsByStacksAccount) }),
    [list]
  );
}
