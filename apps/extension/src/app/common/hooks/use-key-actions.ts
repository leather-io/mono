import { useMemo } from 'react';

import { generateMnemonic, getMnemonicRootKeyFingerprint } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';
import { resetWallet } from '@leather.io/state';

import { InternalMethods } from '@shared/message-types';
import { sendMessage } from '@shared/messages';
import { clearChromeStorage } from '@shared/storage/redux-persist';
import { analytics } from '@shared/utils/analytics';

import { queryClient } from '@app/common/persistence';
import { partiallyClearLocalStorage } from '@app/common/store-utils';
import { useBitcoinClient } from '@app/query/bitcoin/clients/bitcoin-client';
import { useBnsV2Client } from '@app/query/stacks/bns/bns-v2-client';
import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { userSwitchesAccount, walletKeyGenerated } from '@app/store/active/active.slice';
import { createNewAccount } from '@app/store/chains/stx-chain.actions';
import { useStacksClient } from '@app/store/common/api-clients.hooks';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';
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
      setPassword(password: string) {
        return dispatch(
          keyActions.setWalletEncryptionPassword({ password, stxClient, btcClient, bnsV2Client })
        );
      },
      setPasswordUpdated({
        mnemonic,
        password,
        fingerprint,
      }: {
        mnemonic: string;
        password: string;
        fingerprint: string;
      }) {
        return dispatch(
          keyActions.setWalletEncryptionPasswordUpdated({
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
        // if (activeSoftwareKey) {
        //   logger.warn('Cannot generate new wallet when wallet already exists');
        //   return;
        // }
        const mnemonic = generateMnemonic();
        const fingerprint = getMnemonicRootKeyFingerprint(mnemonic);
        inMemoryStore.setKey(fingerprint, mnemonic);
        dispatch(walletKeyGenerated(fingerprint));
      },
      generateWalletKeyUpdated() {
        // if (activeSoftwareKey) {
        //   logger.warn('Cannot generate new wallet when wallet already exists');
        //   return;
        // }
        const mnemonic = generateMnemonic();
        const fingerprint = getMnemonicRootKeyFingerprint(mnemonic);
        return { mnemonic, fingerprint };
        // inMemoryStore.setKey(fingerprint, mnemonic);
        // dispatch(walletKeyGenerated(fingerprint));
      },

      unlockWallet(password: string) {
        return dispatch(keyActions.unlockWalletAction(password));
      },

      switchAccount(accountId: AccountId) {
        void sendMessage({
          method: InternalMethods.AccountChanged,
          payload: accountId,
        });
        return dispatch(userSwitchesAccount(accountId));
      },

      createNewAccount(fingerprint?: string) {
        if (!activeAccount) throw new Error('No active account');
        return dispatch(createNewAccount(fingerprint ? fingerprint : activeAccount.fingerprint));
      },

      async signOut() {
        await clearWalletSession();
        dispatch(resetWallet());
        await clearChromeStorage();
        partiallyClearLocalStorage();
        analytics.track('sign_out');
        queryClient.clear();
      },

      async lockWallet({ afterLock }: { afterLock?(): void }) {
        await clearWalletSession();
        inMemoryStore.clearAll();
        afterLock?.();
        window.location.reload();
      },
    }),
    [activeAccount, bnsV2Client, btcClient, dispatch, stxClient]
  );
}
