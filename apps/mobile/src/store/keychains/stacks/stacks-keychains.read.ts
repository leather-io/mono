import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { selectNetworkPreference } from '@/store/settings/settings.read';
import { mnemonicStore } from '@/store/storage-persistors';
import { createSelector } from '@reduxjs/toolkit';

import { decomposeDescriptor } from '@leather.io/crypto';
import {
  StacksSigner,
  createSignFnFromMnemonic,
  initalizeStacksSigner,
  stacksChainIdToCoreNetworkMode,
} from '@leather.io/stacks';

import { descriptorKeychainSelectors, filterKeychainsByStacksAccount } from '../keychains';
import { adapter } from './stacks-keychains.write';

const stacksKeychainSelectors = adapter.getSelectors((state: RootState) => state.keychains.stacks);

function createSignFnFromBiometricMnemonicStore(descriptor: string) {
  const { keyOrigin, fingerprint } = decomposeDescriptor(descriptor);
  return createSignFnFromMnemonic(keyOrigin, () => mnemonicStore(fingerprint).getMnemonic());
}

const stacksSigners = createSelector(
  stacksKeychainSelectors.selectAll,
  selectNetworkPreference,
  (accounts, network) =>
    accounts.map(account =>
      initalizeStacksSigner({
        descriptor: account.descriptor,
        network: stacksChainIdToCoreNetworkMode(network.chain.stacks.chainId),
        signFn: createSignFnFromBiometricMnemonicStore(account.descriptor),
      })
    )
);

export function useStacksSigners() {
  const list = useSelector(stacksSigners);
  return useMemo(
    () => ({ ...descriptorKeychainSelectors(list, filterKeychainsByStacksAccount) }),
    [list]
  );
}

export function useStacksSignerAddresses() {
  const { list: stacksSigners } = useStacksSigners();

  return useMemo(() => stacksSigners.map(signer => signer.address), [stacksSigners]);
}

export function useStacksSignerAddressFromAccountIndex(fingerprint: string, accountIndex: number) {
  const signers = useStacksSigners().fromAccountIndex(fingerprint, accountIndex);
  return signers.map(signer => signer.address)[0];
}

export function stacksSignerFromAddress(address: string) {
  return function (signer: StacksSigner) {
    return signer.address === address;
  };
}
