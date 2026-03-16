import { userRemovesWallet } from '@leather.io/state/wallet';

import { AppThunk } from '..';
import { selectAllWallets } from '../wallets/wallet.selectors';
import { selectActiveAccount } from './active.selectors';
import { userSwitchesAccount } from './active.slice';

// ts-unused-exports:disable-next-line
export function removeWalletAndUpdateActive(fingerprint: string): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const activeAccount = selectActiveAccount(state);
    const allWallets = selectAllWallets(state);

    dispatch(userRemovesWallet({ fingerprint }));

    if (activeAccount?.fingerprint === fingerprint) {
      const remainingWallet = allWallets.find(w => w.fingerprint !== fingerprint);
      if (remainingWallet) {
        dispatch(
          userSwitchesAccount({ fingerprint: remainingWallet.fingerprint, accountIndex: 0 })
        );
      } else {
        dispatch(userSwitchesAccount(null));
      }
    }
  };
}
