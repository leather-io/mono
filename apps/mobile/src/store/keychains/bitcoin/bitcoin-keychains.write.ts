import { userAddsAccount } from '@/store/accounts/accounts.write';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';
import { handleAppResetWithState } from '@leather.io/state';
import { userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

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
        userAddsAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.bitcoin)
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(adapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});
