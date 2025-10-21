import { userAddsAccount } from '@/store/accounts/accounts.write';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';
import { handleAppResetWithState } from '@leather.io/state';
import { userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { handleEntityActionWith } from '../utils';
import { BitcoinKeychain } from './bitcoin/utils';
import { filterKeychainsToRemove } from './keychains';
import { StacksKeychain } from './stacks/utils';

export type Keychain = BitcoinKeychain | StacksKeychain;

export const keychainAdapter = createEntityAdapter<Keychain, string>({
  selectId: keychain => extractKeyOriginPathFromDescriptor(keychain.descriptor),
});

const initialState = keychainAdapter.getInitialState();

export const keychainSlice = createSlice({
  name: 'keychains',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(
        userAddsWallet,
        handleEntityActionWith(keychainAdapter.addMany, payload => payload.accountKeychains)
      )

      .addCase(
        userAddsAccount,
        handleEntityActionWith(keychainAdapter.addMany, payload => payload.accountKeychains)
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(keychainAdapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});
