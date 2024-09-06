import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { selectNetwork } from '@/store/settings/settings.write';
import { mnemonicStore } from '@/store/storage-persistors';
import { createSelector } from '@reduxjs/toolkit';

import { decomposeDescriptor } from '@leather.io/crypto';
import {
  createSignFnFromMnemonic,
  initalizeStacksSigner,
  stacksChainIdToCoreNetworkMode,
} from '@leather.io/stacks';

import { descriptorKeychainSelectors, filterKeychainsByStacksAccount } from '../keychains';
import { adapter } from './stacks-keychains.write';

export const stacksKeychainSelectors = adapter.getSelectors(
  (state: RootState) => state.keychains.stacks
);

function createSignFnFromBiometricMnemonicStore(descriptor: string) {
  const { keyOrigin, fingerprint } = decomposeDescriptor(descriptor);
  return createSignFnFromMnemonic(keyOrigin, () => mnemonicStore(fingerprint).getMnemonic());
}

const stacksKeychainList = createSelector(
  stacksKeychainSelectors.selectAll,
  selectNetwork,
  (accounts, network) =>
    accounts.map(account =>
      initalizeStacksSigner({
        descriptor: account.descriptor,
        network: stacksChainIdToCoreNetworkMode(network.chain.stacks.chainId),
        signFn: createSignFnFromBiometricMnemonicStore(account.descriptor),
      })
    )
);

export function useStacksKeychains() {
  const list = useSelector(stacksKeychainList);
  return useMemo(
    () => ({ ...descriptorKeychainSelectors(list, filterKeychainsByStacksAccount) }),
    [list]
  );
}
