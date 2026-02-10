import { useMemo } from 'react';

import { generateMnemonic } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';
import { resetWallet } from '@leather.io/state';

import { logger } from '@shared/logger';
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
import { userSwitchesAccount } from '@app/store/active/active.slice';
import { createNewAccount } from '@app/store/chains/stx-chain.actions';
import { useStacksClient } from '@app/store/common/api-clients.hooks';
import { inMemoryKeyActions } from '@app/store/in-memory-key/in-memory-key.actions';
import { clearWalletSession } from '@app/store/session-restore';
import { keyActions } from '@app/store/software-keys/software-key.actions';
import { useActiveSoftwareKey } from '@app/store/software-keys/software-key.selectors';

export function useKeyActions() {
  const dispatch = useAppDispatch();
  const activeSoftwareKey = useActiveSoftwareKey();
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

      generateWalletKey() {
        if (activeSoftwareKey) {
          logger.warn('Cannot generate new wallet when wallet already exists');
          return;
        }
        return dispatch(inMemoryKeyActions.generateWalletKey(generateMnemonic()));
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

      createNewAccount() {
        if (!activeAccount) throw new Error('No active account');
        return dispatch(createNewAccount(activeAccount.fingerprint));
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
        dispatch(inMemoryKeyActions.lockWallet());
        afterLock?.();
        window.location.reload();
      },
    }),
    [activeAccount, bnsV2Client, btcClient, activeSoftwareKey, dispatch, stxClient]
  );
}
