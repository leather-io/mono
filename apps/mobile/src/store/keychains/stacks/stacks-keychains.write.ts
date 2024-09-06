import { userAddsAccount } from '@/store/accounts/accounts.write';
import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '@/store/global-action';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';

import { handleEntityActionWith } from '../../utils';
import { filterKeychainsToRemove } from '../keychains';

export interface StacksKeychainStore {
  // Stacks doesn't use the concept of BIP-380 Descriptors the same way Bitcoin
  // does. However, we need to store the same data. Reusing this structure
  // provides a consistent interface between keychain stores. The `descriptor`
  // field here is used to store the derivation path and public key, rather than
  // extended public key (xpub) used in Bitcoin store.
  descriptor: string;
}
export const adapter = createEntityAdapter<StacksKeychainStore, string>({
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
