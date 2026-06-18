import { useMemo } from 'react';

import { generateMnemonic, getMnemonicRootKeyFingerprint } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';
import { resetWallet } from '@leather.io/state';

import { broadcastWalletLock } from '@shared/messages';
import { clearChromeStorage } from '@shared/storage/redux-persist';
import { analytics } from '@shared/utils/analytics';

import { queryClient } from '@app/common/persistence';
import { partiallyClearLocalStorage } from '@app/common/store-utils';
import { useBitcoinClient } from '@app/query/bitcoin/clients/bitcoin-client';
import { useBnsV2Client } from '@app/query/stacks/bns/bns-v2-client';
import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { changeActiveAccount } from '@app/store/active/active.actions';
import { createNewAccount } from '@app/store/chains/stx-chain.actions';
import { useStacksClient } from '@app/store/common/api-clients.hooks';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '@app/store/in-memory-key/keychain-selector-cache';
import { clearWalletSession } from '@app/store/session-restore';
import { keyActions } from '@app/store/software-keys/software-key.actions';

export function useKeyActions() {
  const dispatch = useAppDispatch();
  const activeAccount = useCurrentAccountId();
  const btcClient = useBitcoinClient();
  const stxClient = useStacksClient();
  const bnsV2Client = useBnsV2Client();

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
            stxClient,
            btcClient,
            bnsV2Client,
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

      switchAccount(accountId: AccountId) {
        void dispatch(changeActiveAccount(accountId));
      },

      createNewAccount(fingerprint?: string) {
        if (!activeAccount) throw new Error('No active account');
        return dispatch(createNewAccount(fingerprint ? fingerprint : activeAccount.fingerprint));
      },

      async signOut() {
        await clearWalletSession();
        inMemoryStore.clearAll();
        clearKeychainSelectorCaches();
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
    [activeAccount, bnsV2Client, btcClient, dispatch, stxClient]
  );
}
