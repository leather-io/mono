import { deriveRootKeychainFromMnemonicSync, makeAccountIdentifer } from '@leather.io/crypto';
import { stacksRootKeychainToAccountDescriptorV2 } from '@leather.io/stacks';
import { userAddsAccount } from '@leather.io/state/keychains';

import { logger } from '@shared/logger';

import { AppThunk, persistor } from '@app/store';

import { userSwitchesAccount } from '../active/active.slice';
import * as inMemoryStore from '../in-memory-key/in-memory-storage';
import { readAuthoritativeWalletTransactionState } from '../software-keys/software-key-state';
import { hydrateSlicesFromStorage } from '../utils/storage-sync';
import { withWalletWriteLock } from '../wallets/wallet-write-lock';
import { selectStacksChain } from './stx-chain.selectors';
import { stxChainSlice } from './stx-chain.slice';

export function createNewAccount(fingerprint: string): AppThunk {
  return async (dispatch, getState) => {
    await withWalletWriteLock(async () => {
      const authoritative = await readAuthoritativeWalletTransactionState();
      dispatch(hydrateSlicesFromStorage(authoritative.state));
      const state = { ...getState(), ...authoritative.state };
      const secretKey = inMemoryStore.getKey(fingerprint);

      if (!secretKey || !authoritative.state.wallets.entities[fingerprint]) {
        logger.error('No keychain found for fingerprint:', { fingerprint });
        throw new Error('Unable to create account. Wallet keychain not found');
      }

      const keychain = deriveRootKeychainFromMnemonicSync(secretKey);

      const stxChain = selectStacksChain(state);
      const walletChain = stxChain[fingerprint];
      const highestIndex = walletChain?.highestAccountIndex ?? -1;

      const stacksDescriptor = stacksRootKeychainToAccountDescriptorV2(keychain, highestIndex + 1);

      const newAccountIndex = highestIndex + 1;
      const accountId = makeAccountIdentifer(fingerprint, newAccountIndex);

      dispatch(
        stxChainSlice.actions.createNewAccount({
          fingerprint,
          accountIndex: newAccountIndex,
          descriptor: stacksDescriptor,
        })
      );

      // Materialize the account entity in the accounts slice. No keychains are
      // passed as software accounts derive their keys lazily from the index.
      dispatch(
        userAddsAccount({
          account: { id: accountId },
          accountKeychains: [],
        })
      );

      dispatch(
        userSwitchesAccount({
          fingerprint,
          accountIndex: newAccountIndex,
        })
      );

      try {
        await persistor.flush();
      } catch {
        dispatch(hydrateSlicesFromStorage(authoritative.state));
        throw new Error('Unable to create account. Persisted account state is invalid');
      }
      const persisted = await readAuthoritativeWalletTransactionState().catch(() => {
        dispatch(hydrateSlicesFromStorage(authoritative.state));
        throw new Error('Unable to create account. Persisted account state is invalid');
      });
      const persistedAccount = persisted.state.accounts.entities[accountId];
      const persistedChain = persisted.state.chains.stx[fingerprint];
      const persistedActive = persisted.state.active.account;
      if (
        !persistedAccount ||
        persistedChain?.highestAccountIndex !== newAccountIndex ||
        persistedChain.currentAccountStacksDescriptor !== stacksDescriptor ||
        persistedActive?.fingerprint !== fingerprint ||
        persistedActive.accountIndex !== newAccountIndex
      ) {
        dispatch(hydrateSlicesFromStorage(persisted.state));
        throw new Error('Unable to create account. Persisted account state is invalid');
      }

      logger.info('Account created for wallet', {
        fingerprint,
        accountIndex: newAccountIndex,
      });
    });
  };
}
