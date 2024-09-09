import { userAddsAccount } from '@/store/accounts/accounts.write';
import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '@/store/global-action';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';

import { handleEntityActionWith } from '../../utils';
import { filterKeychainsToRemove } from '../keychains';

export interface BitcoinKeychainStore {
  descriptor: string;
}
const adapter = createEntityAdapter<BitcoinKeychainStore, string>({
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
        userAddsAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.bitcoin)
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(adapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});
