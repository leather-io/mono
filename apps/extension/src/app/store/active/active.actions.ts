import { AccountId } from '@leather.io/models';
import { userRemovesWallet } from '@leather.io/state/wallet';

import { InternalMethods } from '@shared/message-types';
import { sendMessage } from '@shared/messages';

import { AppThunk } from '..';
import { removeKey } from '../in-memory-key/in-memory-storage';
import { selectAllWallets } from '../wallets/wallet.selectors';
import { selectActiveAccount } from './active.selectors';
import { userSwitchesAccount } from './active.slice';

export function changeActiveAccount(accountId: AccountId): AppThunk {
  return dispatch => {
    void sendMessage({ method: InternalMethods.AccountChanged, payload: accountId });
    dispatch(userSwitchesAccount(accountId));
  };
}

// ts-unused-exports:disable-next-line
export function removeWalletAndUpdateActive(fingerprint: string): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const activeAccount = selectActiveAccount(state);
    const allWallets = selectAllWallets(state);

    dispatch(userRemovesWallet({ fingerprint }));
    removeKey(fingerprint);

    if (activeAccount?.fingerprint === fingerprint) {
      const remainingWallet = allWallets.find(w => w.fingerprint !== fingerprint);
      if (remainingWallet) {
        void dispatch(
          changeActiveAccount({ fingerprint: remainingWallet.fingerprint, accountIndex: 0 })
        );
      } else {
        dispatch(userSwitchesAccount(null));
      }
    }
  };
}
