import { WalletId } from '@/models/domain.model';
import { t } from '@lingui/macro';
import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { produce } from 'immer';

import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '../global-action';
import { handleEntityActionWith } from '../utils';
import { PartialWalletStore, WalletStore } from './utils';

function addWalletDefaults({
  wallet,
  walletIdx,
}: {
  wallet: PartialWalletStore;
  walletIdx: number;
}): WalletStore {
  const updatedWallet = produce(wallet, draftWallet => {
    if (!draftWallet.name) {
      draftWallet.name = t({
        id: 'wallet.default.name',
        message: `Wallet ${walletIdx}`,
      });
    }
    return draftWallet;
  });
  return updatedWallet as WalletStore;
}

export const walletAdapter = createEntityAdapter<WalletStore, string>({
  selectId: key => key.fingerprint,
});

const initialState = walletAdapter.getInitialState();

interface RenameWalletPayload extends WalletId {
  name: string;
}
export const userRenamesWallet = createAction<RenameWalletPayload>('accounts/renameAccount');

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
