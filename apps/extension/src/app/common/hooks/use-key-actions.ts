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
import {
  type WalletAuthenticationResult,
  useWalletAuthentication,
} from '@app/common/wallet-authentication/use-wallet-authentication';
import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { userSwitchesAccount, userSwitchesToPolicy } from '@app/store/active/active.slice';
import { createNewAccount } from '@app/store/chains/stx-chain.actions';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '@app/store/in-memory-key/keychain-selector-cache';
import { parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { clearWalletSession } from '@app/store/session-restore';
import { keyActions } from '@app/store/software-keys/software-key.actions';

function unavailableWalletAuthenticationResult(): WalletAuthenticationResult<void> {
  return { status: 'failure', code: 'unavailable' };
}

export function useKeyActions() {
  const dispatch = useAppDispatch();
  const activeAccount = useCurrentAccountId();
  const walletAuthentication = useWalletAuthentication();

  return useMemo(
    () => ({
      setPassword({
        mnemonic,
        password,
        fingerprint,
      }: {
        mnemonic: string;
        password: string;
        fingerprint: string;
      }) {
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

      generateWalletKey() {
        const mnemonic = generateMnemonic();
        const fingerprint = getMnemonicRootKeyFingerprint(mnemonic);
        return { mnemonic, fingerprint };
      },

      unlockWallet(password: string) {
        return dispatch(keyActions.unlockWalletAction(password));
      },

      async authenticateWalletWithPassword(
        password: string
      ): Promise<WalletAuthenticationResult<void>> {
        try {
          await dispatch(keyActions.unlockWalletAction(password));
          return { status: 'success', value: undefined };
        } catch {
          return { status: 'failure', code: 'invalid-password' };
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
        } catch {
          return unavailableWalletAuthenticationResult();
        }
      },

      async createBiometricSoftwareWallet({
        fingerprint,
        mnemonic,
      }: {
        fingerprint: string;
        mnemonic: string;
      }): Promise<WalletAuthenticationResult<void>> {
        const preparation = await walletAuthentication.prepareBiometricSoftwareWallet({
          fingerprint,
          mnemonic,
        });
        if (preparation.status === 'failure') return preparation;
        try {
          await dispatch(
            keyActions.createBiometricSoftwareWallet({
              fingerprint,
              mnemonic,
              preparation: preparation.value,
              leatherApiClient: getLeatherApiClient(),
              hiroClient: getHiroStacksApiClient(),
              bnsClient: getBnsV2ApiClient(),
            })
          );
          await clearBiometricAutoPromptSuppression();
          return { status: 'success', value: undefined };
        } catch {
          return unavailableWalletAuthenticationResult();
        }
      },

      async savePlatformUnlockWithPassword(
        password: string
      ): Promise<WalletAuthenticationResult<void>> {
        const change = await walletAuthentication.preparePlatformUnlockWithPassword(password);
        if (change.status === 'failure') return change;
        try {
          await dispatch(keyActions.commitPlatformUnlockChange(change.value));
          await clearBiometricAutoPromptSuppression();
          return { status: 'success', value: undefined };
        } catch {
          return unavailableWalletAuthenticationResult();
        }
      },

      async replacePlatformUnlockWithBiometrics(): Promise<WalletAuthenticationResult<void>> {
        const change = await walletAuthentication.preparePlatformUnlockWithBiometrics();
        if (change.status === 'failure') return change;
        try {
          await dispatch(keyActions.commitPlatformUnlockChange(change.value));
          await clearBiometricAutoPromptSuppression();
          return { status: 'success', value: undefined };
        } catch {
          return unavailableWalletAuthenticationResult();
        }
      },

      async disablePlatformUnlock() {
        await dispatch(keyActions.disablePlatformUnlock());
        await clearBiometricAutoPromptSuppression();
      },

      async setBiometricOnlyPasswordTransition(
        password: string
      ): Promise<WalletAuthenticationResult<void>> {
        const transition =
          await walletAuthentication.prepareBiometricOnlyToPasswordTransition(password);
        if (transition.status === 'failure') return transition;
        try {
          await dispatch(keyActions.commitBiometricOnlyToPasswordTransition(transition.value));
          await clearBiometricAutoPromptSuppression();
          return { status: 'success', value: undefined };
        } catch {
          return unavailableWalletAuthenticationResult();
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
        } catch {
          return unavailableWalletAuthenticationResult();
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
        await clearWalletSession();
        await clearBiometricAutoPromptSuppression();
        inMemoryStore.clearAll();
        clearKeychainSelectorCaches();
        void broadcastSignOut();
        dispatch(resetWallet());
        await clearChromeStorage();
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
