import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { mnemonicStore } from '@/store/secure-store/mnemonic-store';
import { selectNetworkPreference } from '@/store/settings/settings.read';
import { createSelector } from '@reduxjs/toolkit';

import { decomposeDescriptor } from '@leather.io/crypto';
import {
  StacksSigner,
  createSignFnFromMnemonic,
  createSignMessageFnFromMnemonic,
  createSignStructuredDataMessageFnFromMnemonic,
  initalizeStacksSigner,
  stacksChainIdToCoreNetworkMode,
} from '@leather.io/stacks';
import {
  descriptorKeychainSelectors,
  filterKeychainsByStacksAccount,
} from '@leather.io/state/keychains';

import { keychainSelectors } from '../keychains.read';

function createSignFnFromBiometricMnemonicStore(descriptor: string) {
  const { keyOrigin, fingerprint } = decomposeDescriptor(descriptor);
  return createSignFnFromMnemonic(keyOrigin, () => mnemonicStore(fingerprint).getMnemonic());
}
function createSignMessageFnFromBiometricMnemonicStore(descriptor: string) {
  const { keyOrigin, fingerprint } = decomposeDescriptor(descriptor);
  return createSignMessageFnFromMnemonic(keyOrigin, () => mnemonicStore(fingerprint).getMnemonic());
}
function createSignStructuredMessageFnFromBiometricMnemonicStore(descriptor: string) {
  const { keyOrigin, fingerprint } = decomposeDescriptor(descriptor);
  return createSignStructuredDataMessageFnFromMnemonic(keyOrigin, () =>
    mnemonicStore(fingerprint).getMnemonic()
  );
}

const stacksSigners = createSelector(
  keychainSelectors.selectAll,
  selectNetworkPreference,
  (keychains, network) =>
    keychains
      .filter(keychain => keychain.chain === 'stacks')
      .map(keychain =>
        initalizeStacksSigner({
          descriptor: keychain.descriptor,
          network: stacksChainIdToCoreNetworkMode(network.chain.stacks.chainId),
          signFn: createSignFnFromBiometricMnemonicStore(keychain.descriptor),
          signMessageFn: createSignMessageFnFromBiometricMnemonicStore(keychain.descriptor),
          signStructuredMessageFn: createSignStructuredMessageFnFromBiometricMnemonicStore(
            keychain.descriptor
          ),
        })
      )
);

export function useStacksSigners() {
  const list = useSelector(stacksSigners);
  return useMemo(
    () => ({
      ...descriptorKeychainSelectors(list, filterKeychainsByStacksAccount),
    }),
    [list]
  );
}

export function useStacksSignerAddressFromAccountIndex(fingerprint: string, accountIndex: number) {
  const signers = useStacksSigners().fromAccountIndex(fingerprint, accountIndex);
  return signers.map(signer => signer.address)[0];
}

export function stacksSignerFromAddress(address: string) {
  return (signer: StacksSigner) => signer.address === address;
}
