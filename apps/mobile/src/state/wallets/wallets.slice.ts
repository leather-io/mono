import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { RootState } from '..';
import {
  AddWalletAction,
  handleAppResetWithState,
  userAddsWallet,
  userRemovesWallet,
} from '../global-action';
import { mnemonicStore } from '../storage-persistors';
import { handleEntityActionWith, useAppDispatch, useAppSelector } from '../utils';

export interface AbstractWalletStore {
  fingerprint: string;
  createdOn: string;
  name?: string;
}

export interface SoftwareWalletStore extends AbstractWalletStore {
  type: 'software';
}

export type WalletStore = SoftwareWalletStore; // Next HardwareWallet;

const adapter = createEntityAdapter<WalletStore, string>({
  selectId: key => key.fingerprint,
});

const initialState = adapter.getInitialState();

export const walletSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(
        userAddsWallet,
        handleEntityActionWith(adapter.addOne, payload => payload.wallet)
      )

      .addCase(
        userRemovesWallet,
        handleEntityActionWith(adapter.removeOne, payload => payload.fingerprint)
      )

      .addCase(...handleAppResetWithState(initialState)),
});

const selectors = adapter.getSelectors((state: RootState) => state.wallets);

export function useWallets() {
  const dispatch = useAppDispatch();

  return {
    list: useAppSelector(selectors.selectAll),
    add(action: AddWalletAction) {
      return dispatch(userAddsWallet(action));
    },
    remove(fingerprint: string) {
      void mnemonicStore(fingerprint).deleteMnemonic();
      return dispatch(userRemovesWallet({ fingerprint }));
    },
  };
}
