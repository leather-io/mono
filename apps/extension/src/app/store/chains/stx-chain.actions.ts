import { stacksRootKeychainToAccountDescriptorV2 } from '@leather.io/stacks';

import { logger } from '@shared/logger';

import { AppThunk } from '@app/store';

import { selectRootKeychains } from '../in-memory-key/in-memory-key.selectors';
import { selectStacksChain } from './stx-chain.selectors';
import { stxChainSlice } from './stx-chain.slice';

export function createNewAccount(fingerprint: string): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const rootKeychains = selectRootKeychains(state);

    const keychain = rootKeychains[fingerprint];

    if (!keychain) {
      logger.error('No keychain found for fingerprint:', { fingerprint });
      throw new Error('Unable to create account. Wallet keychain not found');
    }

    const stxChain = selectStacksChain(state);
    const walletChain = stxChain[fingerprint];
    const highestIndex = walletChain?.highestAccountIndex ?? -1;

    const stacksDescriptor = stacksRootKeychainToAccountDescriptorV2(keychain, highestIndex + 1);

    dispatch(
      stxChainSlice.actions.createNewAccount({
        fingerprint,
        descriptor: stacksDescriptor,
      })
    );

    logger.info('Account created for wallet', {
      fingerprint,
      accountIndex: highestIndex + 1,
    });
  };
}
