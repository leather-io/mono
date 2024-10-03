import { WalletId } from '@/models/domain.model';
import { t } from '@lingui/macro';
import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { produce } from 'immer';

import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '../global-action';
import { Optional, handleEntityActionWith } from '../utils';

export interface AbstractWalletStore {
  fingerprint: string;
  createdOn: string;
  name: string;
}

export interface SoftwareWalletStore extends AbstractWalletStore {
  type: 'software';
}

export interface LedgerWalletStore extends AbstractWalletStore {
  type: 'ledger';
}

export type WalletStore = SoftwareWalletStore | LedgerWalletStore; // Next HardwareWallet;

export type PartialWalletStore = Optional<WalletStore, 'name'>;

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
          addWalletDefaults({ wallet: action.payload.wallet, walletIdx: state.ids.length })
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
