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
import { BitcoinKeychain } from './utils';

const adapter = createEntityAdapter<BitcoinKeychain, string>({
  selectId: keychain => extractKeyOriginPathFromDescriptor(keychain.descriptor),
});

export { adapter as bitcoinKeychainAdapter };

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
        userAddsReadonlyWallet,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.bitcoin ?? [])
      )

      .addCase(
        userAddsAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.bitcoin)
      )

      .addCase(
        userAddsReadonlyAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.bitcoin ?? [])
      )

      .addCase(
        userAddsBitcoinKeychain,
        handleEntityActionWith(adapter.addMany, payload => payload.bitcoinKeychains)
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(adapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});

export interface AddBitcoinKeychainPayload {
  bitcoinKeychains: BitcoinKeychain[];
}

export const userAddsBitcoinKeychain = createAction<AddBitcoinKeychainPayload>(
  'bitcoin-keychains/userAddsBitcoinKeychain'
);
