import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';

import { handleEntityActionWith } from '../entity.helpers';
import { handleAppResetWithState } from '../index';
import { userAddsWallet, userRemovesWallet } from '../wallet/wallet.slice';
import { BitcoinKeychain } from './bitcoin/bitcoin-keychain.utils';
import { filterKeychainsToRemove } from './keychain.utils';
import { StacksKeychain } from './stacks/stacks-keychain.utils';

export type Keychain = BitcoinKeychain | StacksKeychain;

export const keychainAdapter = createEntityAdapter<Keychain, string>({
  selectId: keychain => extractKeyOriginPathFromDescriptor(keychain.descriptor),
});

const initialState = keychainAdapter.getInitialState();

interface AddAccountPayload {
  account: { id: string };
  accountKeychains: Keychain[];
}
export const userAddsAccount = createAction<AddAccountPayload>('accounts/userAddsAccount');

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
