import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { type SupportedBlockchains, type WalletId } from '@leather.io/models';

import { handleAppResetWithState } from '../app-reset';
import { handleEntityActionWith } from '../entity.helpers';
import { type PartialWalletStore, type WalletStore } from './wallet.utils';

export const walletAdapter = createEntityAdapter<WalletStore, string>({
  selectId: key => key.fingerprint,
});

const initialState = walletAdapter.getInitialState();

interface RenameWalletPayload extends WalletId {
  name: string;
}
export const userRenamesWallet = createAction<RenameWalletPayload>('global/userRenamesWallet');

function addWalletDefaults({
  wallet,
  walletIdx,
}: {
  wallet: PartialWalletStore;
  walletIdx: number;
}): WalletStore {
  return { ...wallet, name: wallet.name || `Wallet ${walletIdx}` };
}

export interface AddWalletPayload {
  wallet: PartialWalletStore;
  accountKeychains: { descriptor: string; chain: SupportedBlockchains }[];
}
export const userAddsWallet = createAction<AddWalletPayload>('global/userAddsWallet');

type RemoveWalletPayload = WalletId;
export const userRemovesWallet = createAction<RemoveWalletPayload>('global/userRemovesWallet');

export const fingerprintMigration = createAction<string>('global/fingerprintMigration');

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
