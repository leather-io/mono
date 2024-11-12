import { userAddsAccount, userAddsAccounts } from '@/store/accounts/accounts.write';
import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '@/store/global-action';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

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
        handleEntityActionWith(adapter.addMany, payload => {
          console.log('userAddsWallet', payload);
          return payload.withKeychains.bitcoin;
        })
      )

      .addCase(
        userAddsAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains.bitcoin)
      )

      .addCase(
        userAddsAccounts,
        handleEntityActionWith(adapter.addMany, payload =>
          payload.flatMap(account => account.withKeychains.bitcoin)
        )
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(adapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});
