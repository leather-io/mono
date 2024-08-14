import { t } from '@lingui/macro';
import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { produce } from 'immer';

import { RootState } from '..';
import {
  AddWalletAction,
  handleAppResetWithState,
  userAddsWallet,
  userRemovesWallet,
} from '../global-action';
import { mnemonicStore } from '../storage-persistors';
import { Optional, handleEntityActionWith, useAppDispatch, useAppSelector } from '../utils';

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
      draftWallet.name = t`Wallet ${walletIdx}`;
    }
    return draftWallet;
  });
  return updatedWallet as WalletStore;
}

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
      .addCase(userAddsWallet, (state, action) =>
        adapter.addOne(
          state,
          addWalletDefaults({ wallet: action.payload.wallet, walletIdx: state.ids.length })
        )
      )

      .addCase(
        userRemovesWallet,
        handleEntityActionWith(adapter.removeOne, payload => payload.fingerprint)
      )

      .addCase(
        userRenamesWallet,
        handleEntityActionWith(adapter.updateOne, payload => ({
          id: payload.fingerprint,
          changes: { name: payload.name },
        }))
      )

      .addCase(...handleAppResetWithState(initialState)),
});

const selectors = adapter.getSelectors((state: RootState) => state.wallets);

export function useWalletByFingerprint(fingerprint: string) {
  return useAppSelector(state => selectors.selectById(state, fingerprint));
}

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

interface RenameWalletPayload {
  fingerprint: string;
  name: string;
}
export const userRenamesWallet = createAction<RenameWalletPayload>('accounts/renameAccount');
