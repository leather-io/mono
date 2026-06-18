import { makeAccountIdentifer } from '@leather.io/crypto';
import { AccountId } from '@leather.io/models';
import { userRemovesWallet, userRenamesWallet } from '@leather.io/state/wallet';

import { InternalMethods } from '@shared/message-types';
import { broadcastReplayAction, broadcastWalletListChanged, sendMessage } from '@shared/messages';

import { AppThunk, RootState, persistor } from '..';
import { selectHiddenAccountIds } from '../accounts/accounts.selectors';
import { selectWalletAccountRefTree } from '../common/wallet-type.selectors';
import { removeKey } from '../in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '../in-memory-key/keychain-selector-cache';
import { selectCurrentAccount } from '../software-keys/software-key.selectors';
import { selectAllWallets } from '../wallets/wallet.selectors';
import { userSwitchesAccount } from './active.slice';

export function changeActiveAccount(accountId: AccountId): AppThunk {
  return dispatch => {
    void sendMessage({ method: InternalMethods.AccountChanged, payload: accountId });
    dispatch(userSwitchesAccount(accountId));
  };
}

function pickFirstVisibleAccountIndex(accounts: AccountId[], hiddenAccountIds: string[]): number {
  const firstVisibleAccount = accounts.find(
    account =>
      !hiddenAccountIds.includes(makeAccountIdentifer(account.fingerprint, account.accountIndex))
  );
  return firstVisibleAccount?.accountIndex ?? 0;
}

export function activateFirstVisibleAccount(fingerprint: string): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const accounts =
      selectWalletAccountRefTree(state).find(wallet => wallet.fingerprint === fingerprint)
        ?.accounts ?? [];
    dispatch(
      userSwitchesAccount({
        fingerprint,
        accountIndex: pickFirstVisibleAccountIndex(accounts, selectHiddenAccountIds(state)),
      })
    );
  };
}

function selectFirstRemainingAccount(
  state: RootState,
  removedFingerprint: string
): AccountId | null {
  const remainingWallet = selectAllWallets(state).find(w => w.fingerprint !== removedFingerprint);
  if (!remainingWallet) return null;
  const remainingAccounts =
    selectWalletAccountRefTree(state).find(
      wallet => wallet.fingerprint === remainingWallet.fingerprint
    )?.accounts ?? [];
  return {
    fingerprint: remainingWallet.fingerprint,
    accountIndex: pickFirstVisibleAccountIndex(remainingAccounts, selectHiddenAccountIds(state)),
  };
}

// ts-unused-exports:disable-next-line
export function removeWalletAndUpdateActive(fingerprint: string): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    const currentAccount = selectCurrentAccount(state);

    dispatch(userRemovesWallet({ fingerprint }));
    removeKey(fingerprint);
    clearKeychainSelectorCaches();

    if (currentAccount?.fingerprint === fingerprint) {
      const nextAccount = selectFirstRemainingAccount(state, fingerprint);
      if (nextAccount) void dispatch(changeActiveAccount(nextAccount));
      else dispatch(userSwitchesAccount(null));
    }

    await persistor.flush();
    void broadcastWalletListChanged({ removedFingerprint: fingerprint });
  };
}

export function applyRemoteWalletRemoval(removedFingerprint: string): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const currentAccount = selectCurrentAccount(state);

    dispatch(userRemovesWallet({ fingerprint: removedFingerprint }));

    if (currentAccount?.fingerprint !== removedFingerprint) return;

    dispatch(userSwitchesAccount(selectFirstRemainingAccount(state, removedFingerprint)));
  };
}

export function renameWallet(fingerprint: string, name: string): AppThunk {
  return dispatch => {
    const action = userRenamesWallet({ fingerprint, name });
    dispatch(action);
    void broadcastReplayAction(action);
  };
}
