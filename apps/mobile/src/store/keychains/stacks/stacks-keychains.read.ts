import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { selectNetworkPreference } from '@/store/settings/settings.read';
import { mnemonicStore } from '@/store/storage-persistors';
import { selectReadonlyWalletFingerprints } from '@/store/wallets/wallets.read';
import { createSelector } from '@reduxjs/toolkit';

import { decomposeDescriptor, extractFingerprintFromDescriptor } from '@leather.io/crypto';
import {
  createSignFnFromMnemonic,
  createSignMessageFnFromMnemonic,
  createSignStructuredDataMessageFnFromMnemonic,
  initalizeStacksSigner,
  stacksChainIdToCoreNetworkMode,
} from '@leather.io/stacks';

import { descriptorKeychainSelectors, filterKeychainsByStacksAccount } from '../keychains';
import { adapter } from './stacks-keychains.write';
import { ExtendedStacksSigner, ReadWriteStacksSigner, ReadonlyStacksSigner } from './utils';

const stacksKeychainSelectors = adapter.getSelectors((state: RootState) => state.keychains.stacks);

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

function noop(): Promise<any> {
  return Promise.resolve();
}

const selectStacksSigners = createSelector(
  stacksKeychainSelectors.selectAll,
  selectReadonlyWalletFingerprints,
  selectNetworkPreference,
  (accounts, readonlyWalletFingerprints, network): ExtendedStacksSigner[] =>
    accounts.map(account => {
      const accountFingerprint = extractFingerprintFromDescriptor(account.descriptor);
      const isReadonly = readonlyWalletFingerprints.includes(accountFingerprint);
      const stacksSigner = initalizeStacksSigner({
        descriptor: account.descriptor,
        network: stacksChainIdToCoreNetworkMode(network.chain.stacks.chainId),
        signFn: isReadonly ? noop : createSignFnFromBiometricMnemonicStore(account.descriptor),
        signMessageFn: isReadonly
          ? noop
          : createSignMessageFnFromBiometricMnemonicStore(account.descriptor),
        signStructuredMessageFn: isReadonly
          ? noop
          : createSignStructuredMessageFnFromBiometricMnemonicStore(account.descriptor),
      });
      if (isReadonly) {
        return {
          descriptor: stacksSigner.descriptor,
          keyOrigin: stacksSigner.keyOrigin,
          address: stacksSigner.address,
          accountIndex: stacksSigner.accountIndex,
          network: stacksSigner.network,
          publicKey: stacksSigner.publicKey,
          derivationPath: stacksSigner.derivationPath,
          isReadonly,
        } satisfies ReadonlyStacksSigner;
      }
      return {
        ...stacksSigner,
        isReadonly,
      } satisfies ReadWriteStacksSigner;
    })
);

export function useStacksSigners() {
  const list = useSelector(selectStacksSigners);
  return useMemo(
    () => ({ ...descriptorKeychainSelectors(list, filterKeychainsByStacksAccount) }),
    [list]
  );
}

function filterActiveAddresses(stacksSigners: ExtendedStacksSigner[], accounts: Account[]) {
  return stacksSigners.filter(signer =>
    accounts.some(account => {
      const { fingerprint } = decomposeDescriptor(signer.descriptor);
      return account.accountIndex === signer.accountIndex && account.fingerprint === fingerprint;
    })
  );
}

export function useStacksSignerAddresses() {
  const { list: stacksSigners } = useStacksSigners();
  const activeAccounts = useAccounts();
  return useMemo(
    () => filterActiveAddresses(stacksSigners, activeAccounts.list).map(signer => signer.address),
    [stacksSigners, activeAccounts]
  );
}

export function useStacksSignerAddressFromAccountIndex(fingerprint: string, accountIndex: number) {
  const signers = useStacksSigners().fromAccountIndex(fingerprint, accountIndex);
  return signers.map(signer => signer.address)[0];
}

export function stacksSignerFromAddress(address: string) {
  return function (signer: ExtendedStacksSigner) {
    return signer.address === address;
  };
}
