import { deriveRootKeychainFromMnemonicSync, makeAccountIdentifer } from '@leather.io/crypto';
import { stacksRootKeychainToAccountDescriptorV2 } from '@leather.io/stacks';
import { userAddsAccount } from '@leather.io/state/keychains';

import { logger } from '@shared/logger';

import { AppThunk } from '@app/store';

import { userSwitchesAccount } from '../active/active.slice';
import * as inMemoryStore from '../in-memory-key/in-memory-storage';
import { selectStacksChain } from './stx-chain.selectors';
import { stxChainSlice } from './stx-chain.slice';

export function createNewAccount(fingerprint: string): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const secretKey = inMemoryStore.getKey(fingerprint);

    if (!secretKey) {
      logger.error('No keychain found for fingerprint:', { fingerprint });
      throw new Error('Unable to create account. Wallet keychain not found');
    }

    const keychain = deriveRootKeychainFromMnemonicSync(secretKey);

    const stxChain = selectStacksChain(state);
    const walletChain = stxChain[fingerprint];
    const highestIndex = walletChain?.highestAccountIndex ?? -1;

    const stacksDescriptor = stacksRootKeychainToAccountDescriptorV2(keychain, highestIndex + 1);

    const newAccountIndex = highestIndex + 1;

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
        account: { id: makeAccountIdentifer(fingerprint, newAccountIndex) },
        accountKeychains: [],
      })
    );

    dispatch(
      userSwitchesAccount({
        fingerprint,
        accountIndex: newAccountIndex,
      })
    );

    logger.info('Account created for wallet', {
      fingerprint,
      accountIndex: newAccountIndex,
    });
  };
}
