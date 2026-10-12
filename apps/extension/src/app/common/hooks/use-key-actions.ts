import { useMemo } from 'react';

import { generateMnemonic, getMnemonicRootKeyFingerprint } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';
import {
  getBnsV2ApiClient,
  getHiroStacksApiClient,
  getLeatherApiClient,
} from '@leather.io/services';
import { resetWallet } from '@leather.io/state';

import { broadcastSignOut, broadcastWalletLock } from '@shared/messages';
import { clearChromeStorage } from '@shared/storage/redux-persist';
import { analytics } from '@shared/utils/analytics';

import { queryClient } from '@app/common/persistence';
import { partiallyClearLocalStorage } from '@app/common/store-utils';
import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { userSwitchesAccount, userSwitchesToPolicy } from '@app/store/active/active.slice';
import { createNewAccount } from '@app/store/chains/stx-chain.actions';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '@app/store/in-memory-key/keychain-selector-cache';
import { parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { clearWalletSession } from '@app/store/session-restore';
import { keyActions } from '@app/store/software-keys/software-key.actions';

export function useKeyActions() {
  const dispatch = useAppDispatch();
  const activeAccount = useCurrentAccountId();

  return useMemo(
    () => ({
      setPassword(
        this: void,
        {
          mnemonic,
          password,
          fingerprint,
        }: {
          mnemonic: string;
          password: string;
          fingerprint: string;
        }
      ) {
        return dispatch(
          keyActions.setWalletEncryptionPassword({
            mnemonic,
            fingerprint,
            password,
            leatherApiClient: getLeatherApiClient(),
            hiroClient: getHiroStacksApiClient(),
            bnsClient: getBnsV2ApiClient(),
          })
        );
      },

      generateWalletKey(this: void) {
        const mnemonic = generateMnemonic();
        const fingerprint = getMnemonicRootKeyFingerprint(mnemonic);
        return { mnemonic, fingerprint };
      },

      unlockWallet(this: void, password: string) {
        return dispatch(keyActions.unlockWalletAction(password));
      },

      switchAccount(this: void, accountId: AccountId) {
        dispatch(userSwitchesAccount(accountId));
      },

      switchAccountToPolicy(this: void, policyId: string) {
        dispatch(userSwitchesToPolicy({ parent: parsePolicyParent(policyId), policyId }));
      },

      createNewAccount(this: void, fingerprint?: string) {
        if (!activeAccount) throw new Error('No active account');
        return dispatch(createNewAccount(fingerprint ? fingerprint : activeAccount.fingerprint));
      },

      async signOut(this: void) {
        await clearWalletSession();
        inMemoryStore.clearAll();
        clearKeychainSelectorCaches();
        void broadcastSignOut();
        dispatch(resetWallet());
        await clearChromeStorage();
        partiallyClearLocalStorage();
        analytics.track('sign_out');
        queryClient.clear();
      },

      async lockWallet(this: void, { afterLock }: { afterLock?(this: void): void }) {
        await clearWalletSession();
        inMemoryStore.clearAll();
        clearKeychainSelectorCaches();
        void broadcastWalletLock();
        afterLock?.();
        window.location.reload();
      },
    }),
    [activeAccount, dispatch]
  );
}
