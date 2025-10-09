import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { produce } from 'immer';

import { WalletId } from '@leather.io/models';

import { handleEntityActionWith } from '../entity.helpers';
import { handleAppResetWithState } from '../index';
import { PartialWalletStore, WalletStore } from './wallet.utils';

export const walletAdapter = createEntityAdapter<WalletStore, string>({
  selectId: key => key.fingerprint,
});

const initialState = walletAdapter.getInitialState();

interface RenameWalletPayload extends WalletId {
  name: string;
}
export const userRenamesWallet = createAction<RenameWalletPayload>('accounts/renameAccount');

function addWalletDefaults({
  wallet,
  walletIdx,
}: {
  wallet: PartialWalletStore;
  walletIdx: number;
}): WalletStore {
  const updatedWallet = produce(wallet, draftWallet => {
    if (!draftWallet.name) {
      draftWallet.name = `Wallet ${walletIdx}`;
    }
    return draftWallet;
  });
  return updatedWallet as WalletStore;
}

export interface AddWalletAction {
  wallet: PartialWalletStore;
  withKeychains: {
    bitcoin: any[];
    stacks: any[];
  };
}
export const userAddsWallet = createAction<AddWalletAction>('global/userAddsWallet');

type RemoveWalletAction = WalletId;
export const userRemovesWallet = createAction<RemoveWalletAction>('global/userRemovesWallet');

export const walletSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(userAddsWallet, (state, action) =>
        walletAdapter.addOne(
          state,
          addWalletDefaults({ wallet: action.payload.wallet, walletIdx: state.ids.length + 1 })
        )
      )

      .addCase(
        userRemovesWallet,
        handleEntityActionWith(walletAdapter.removeOne, payload => payload.fingerprint)
      )

      .addCase(
        userRenamesWallet,
        handleEntityActionWith(walletAdapter.updateOne, payload => ({
          id: payload.fingerprint,
          changes: { name: payload.name },
        }))
      )

      .addCase(...handleAppResetWithState(initialState)),
});
