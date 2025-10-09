import { userAddsAccount } from '@/store/accounts/accounts.write';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';
import { handleAppResetWithState } from '@leather.io/state';
import { userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { handleEntityActionWith } from '../../utils';
import { filterKeychainsToRemove } from '../keychains';
import { StacksKeychain } from './utils';

export const adapter = createEntityAdapter<StacksKeychain, string>({
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
