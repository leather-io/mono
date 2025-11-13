import { getMnemonicRootKeyFingerprint } from '@leather.io/crypto';
import { stacksRootKeychainToAccountDescriptor } from '@leather.io/stacks';

import { AppThunk } from '@app/store';

import {
  selectActiveWalletKey,
  selectActiveWalletRootKeychain,
} from '../in-memory-key/in-memory-key.selectors';
import { selectHighestAccountIndex } from './stx-chain.selectors';
import { stxChainSlice } from './stx-chain.slice';

export function createNewAccount(): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const secretKey = selectActiveWalletKey(state);
    if (!secretKey) throw new Error('Unable to create a new account. Wallet not signed in');
    const keychain = selectActiveWalletRootKeychain(state);
    const highestIndex = selectHighestAccountIndex(state);
    if (!keychain) throw new Error('No root keychain found');

    const stacksDescriptor = stacksRootKeychainToAccountDescriptor(keychain, highestIndex + 1);

    try {
      const fingerprint = getMnemonicRootKeyFingerprint(secretKey);
      dispatch(
        stxChainSlice.actions.createNewAccount({
          fingerprint,
          descriptor: stacksDescriptor,
        })
      );
    } catch (error) {
      console.error('Error generating fingerprint from secret key:', error);
    }
  };
}
