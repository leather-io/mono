import { GoogleUserData } from '@/hooks/use-google-wallet';
import { t } from '@lingui/core/macro';
import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { produce, type Draft } from 'immer';

import { WalletId } from '@leather.io/models';

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
      draftWallet.name = t`Wallet ${walletIdx}`;
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

interface MarkWalletAsGooglePayload extends WalletId {
  googleData: GoogleUserData;
}
export const userMarksWalletAsGoogle = createAction<MarkWalletAsGooglePayload>(
  'wallets/markWalletAsGoogle'
);

export const userClearsWalletGoogleMetadata = createAction<WalletId>('wallets/clearGoogleMetadata');

function clearGoogleData(wallet?: Draft<WalletStore>) {
  if (!wallet || wallet.type !== 'software') return;
  wallet.googleData = undefined;
}

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
      .addCase(userMarksWalletAsGoogle, (state, action) => {
        const { fingerprint, googleData } = action.payload;

        state.ids.forEach(id => {
          if (id === fingerprint) return;
          const wallet = state.entities[id];
          clearGoogleData(wallet);
        });

        const target = state.entities[fingerprint];
        if (!target || target.type !== 'software') return;

        target.googleData = {
          googleId: googleData.googleId,
          email: googleData.email,
          photo: googleData.photo ?? null,
          familyName: googleData.familyName ?? null,
          givenName: googleData.givenName ?? null,
        };
      })
      .addCase(
        userClearsWalletGoogleMetadata,
        handleEntityActionWith(walletAdapter.updateOne, payload => ({
          id: payload.fingerprint,
          changes: { googleData: undefined },
        }))
      )

      .addCase(...handleAppResetWithState(initialState)),
});
