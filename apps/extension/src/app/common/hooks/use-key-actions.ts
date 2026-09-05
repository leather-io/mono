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
import { clearBiometricAutoPromptSuppression } from '@app/common/wallet-authentication/biometric-auto-prompt';
import { useWalletAuthentication } from '@app/common/wallet-authentication/use-wallet-authentication';
import {
  type WalletAuthenticationResult,
  walletAuthenticationFailureFromError,
} from '@app/common/wallet-authentication/wallet-authentication';
import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { userSwitchesAccount, userSwitchesToPolicy } from '@app/store/active/active.slice';
import { createNewAccount } from '@app/store/chains/stx-chain.actions';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '@app/store/in-memory-key/keychain-selector-cache';
import { parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { clearWalletSession } from '@app/store/session-restore';
import { keyActions } from '@app/store/software-keys/software-key.actions';
import { withWalletWriteLock } from '@app/store/wallets/wallet-write-lock';

export function useKeyActions() {
  const dispatch = useAppDispatch();
  const activeAccount = useCurrentAccountId();
  const walletAuthentication = useWalletAuthentication();

  return useMemo(
    () => ({
      async setPassword({
        mnemonic,
        password,
        fingerprint,
      }: {
        mnemonic: string;
        password: string;
        fingerprint: string;
      }): Promise<WalletAuthenticationResult<void>> {
        try {
          await dispatch(
            keyActions.setWalletEncryptionPassword({
              mnemonic,
              fingerprint,
              password,
              leatherApiClient: getLeatherApiClient(),
              hiroClient: getHiroStacksApiClient(),
              bnsClient: getBnsV2ApiClient(),
            })
          );
          return { status: 'success', value: undefined };
        } catch (error) {
          return walletAuthenticationFailureFromError(error);
        }
      },

      generateWalletKey() {
        const mnemonic = generateMnemonic();
        const fingerprint = getMnemonicRootKeyFingerprint(mnemonic);
        return { mnemonic, fingerprint };
      },

      async authenticateWalletWithPassword(
        password: string
      ): Promise<WalletAuthenticationResult<void>> {
        try {
          await dispatch(keyActions.unlockWalletAction(password));
          return { status: 'success', value: undefined };
        } catch (error) {
          return walletAuthenticationFailureFromError(error);
        }
      },

      async unlockWalletWithBiometrics(): Promise<WalletAuthenticationResult<void>> {
        const authentication = await walletAuthentication.authenticateWithPlatformCredential();
        if (authentication.status === 'failure') return authentication;
        try {
          await dispatch(
            keyActions.unlockWalletWithEncryptionKey({
              encryptionKey: authentication.value.encryptionKey,
              expectedPlatformUnlock: authentication.value.platformUnlock,
            })
          );
          await clearBiometricAutoPromptSuppression();
          return { status: 'success', value: undefined };
        } catch (error) {
          return walletAuthenticationFailureFromError(error);
        }
      },

      async createBiometricSoftwareWallet({
        fingerprint,
        mnemonic,
      }: {
        fingerprint: string;
        mnemonic: string;
      }): Promise<WalletAuthenticationResult<void>> {
        try {
          await dispatch(
            keyActions.createBiometricSoftwareWallet({
              fingerprint,
              mnemonic,
              leatherApiClient: getLeatherApiClient(),
              hiroClient: getHiroStacksApiClient(),
              bnsClient: getBnsV2ApiClient(),
            })
          );
          await clearBiometricAutoPromptSuppression();
          return { status: 'success', value: undefined };
        } catch (error) {
          return walletAuthenticationFailureFromError(error);
        }
      },

      async addWalletWithBiometrics({
        fingerprint,
        mnemonic,
      }: {
        fingerprint: string;
        mnemonic: string;
      }): Promise<WalletAuthenticationResult<void>> {
        const authentication = await walletAuthentication.authenticateWithPlatformCredential();
        if (authentication.status === 'failure') return authentication;
        try {
          await dispatch(
            keyActions.addSoftwareWalletWithEncryptionKey({
              encryptionKey: authentication.value.encryptionKey,
              expectedPlatformUnlock: authentication.value.platformUnlock,
              fingerprint,
              mnemonic,
              leatherApiClient: getLeatherApiClient(),
              hiroClient: getHiroStacksApiClient(),
              bnsClient: getBnsV2ApiClient(),
            })
          );
          await clearBiometricAutoPromptSuppression();
          return { status: 'success', value: undefined };
        } catch (error) {
          return walletAuthenticationFailureFromError(error);
        }
      },

      switchAccount(accountId: AccountId) {
        dispatch(userSwitchesAccount(accountId));
      },

      switchAccountToPolicy(policyId: string) {
        dispatch(userSwitchesToPolicy({ parent: parsePolicyParent(policyId), policyId }));
      },

      createNewAccount(fingerprint?: string) {
        if (!activeAccount) throw new Error('No active account');
        return dispatch(createNewAccount(fingerprint ? fingerprint : activeAccount.fingerprint));
      },

      async signOut() {
        await withWalletWriteLock(async () => {
          await clearWalletSession();
          await clearBiometricAutoPromptSuppression();
          inMemoryStore.clearAll();
          clearKeychainSelectorCaches();
          void broadcastSignOut();
          dispatch(resetWallet());
          await clearChromeStorage();
        });
        partiallyClearLocalStorage();
        analytics.track('sign_out');
        queryClient.clear();
      },

      async lockWallet({ afterLock }: { afterLock?(): void }) {
        await clearWalletSession();
        inMemoryStore.clearAll();
        clearKeychainSelectorCaches();
        void broadcastWalletLock();
        afterLock?.();
        window.location.reload();
      },
    }),
    [activeAccount, dispatch, walletAuthentication]
  );
}
