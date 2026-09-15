import { makeAccountIdentifer } from '@leather.io/crypto';
import { AccountId } from '@leather.io/models';
import { userRemovesWallet } from '@leather.io/state/wallet';

import { broadcastWalletListChanged } from '@shared/messages';

import { clearBiometricAutoPromptSuppression } from '@app/common/wallet-authentication/biometric-auto-prompt';

import { AppThunk, RootState, persistor } from '..';
import { selectHiddenAccountIds } from '../accounts/accounts.selectors';
import { selectWalletAccountRefTree } from '../common/wallet-type.selectors';
import { removeKey } from '../in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '../in-memory-key/keychain-selector-cache';
import { readAuthoritativeWalletTransactionState } from '../software-keys/software-key-state';
import { selectCurrentAccount, selectSoftwareKeys } from '../software-keys/software-key.selectors';
import { hydrateSlicesFromStorage } from '../utils/storage-sync';
import { withWalletWriteLock } from '../wallets/wallet-write-lock';
import { selectAllWallets } from '../wallets/wallet.selectors';
import { userSwitchesAccount } from './active.slice';

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
    await withWalletWriteLock(async () => {
      const authoritative = await readAuthoritativeWalletTransactionState();
      dispatch(hydrateSlicesFromStorage(authoritative.state));
      const state = { ...getState(), ...authoritative.state };
      const currentAccount = selectCurrentAccount(state);
      const removesFinalSoftwareWallet =
        selectSoftwareKeys(state).length === 1 && selectSoftwareKeys(state)[0]?.id === fingerprint;

      dispatch(userRemovesWallet({ fingerprint }));
      removeKey(fingerprint);
      clearKeychainSelectorCaches();

      if (currentAccount?.fingerprint === fingerprint) {
        const nextAccount = selectFirstRemainingAccount(state, fingerprint);
        if (nextAccount) dispatch(userSwitchesAccount(nextAccount));
        else dispatch(userSwitchesAccount(null));
      }

      await persistor.flush();
      if (removesFinalSoftwareWallet) await clearBiometricAutoPromptSuppression();
      void broadcastWalletListChanged({ removedFingerprint: fingerprint });
    });
  };
}

export function applyRemoteWalletRemoval(): AppThunk {
  return async dispatch => {
    await withWalletWriteLock(async () => {
      const authoritative = await readAuthoritativeWalletTransactionState();
      dispatch(hydrateSlicesFromStorage(authoritative.state));
    });
  };
}
