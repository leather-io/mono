import { userAddsAccount, userAddsReadonlyAccount } from '@/store/accounts/accounts.write';
import {
  handleAppResetWithState,
  userAddsReadonlyWallet,
  userAddsWallet,
  userRemovesWallet,
} from '@/store/global-action';
import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';

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
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.stacks)
      )

      .addCase(
        userAddsReadonlyWallet,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.stacks ?? [])
      )

      .addCase(
        userAddsAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.stacks)
      )

      .addCase(
        userAddsReadonlyAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.stacks ?? [])
      )

      .addCase(
        userAddsStacksKeychain,
        handleEntityActionWith(adapter.addMany, payload => payload.stacksKeychains)
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(adapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});

export interface AddStacksKeychainPayload {
  stacksKeychains: StacksKeychain[];
}

export const userAddsStacksKeychain = createAction<AddStacksKeychainPayload>(
  'stacks-keychains/userAddsStacksKeychain'
);
