import { bytesToHex } from '@noble/hashes/utils';
import { createSelector } from '@reduxjs/toolkit';
import { HARDENED_OFFSET, HDKey } from '@scure/bip32';
import {
  AddressVersion,
  createStacksPublicKey,
  privateKeyToPublic,
  publicKeyToAddress,
  publicKeyToAddressSingleSig,
} from '@stacks/transactions';
import { deriveStxPrivateKey } from '@stacks/wallet-sdk';
import { atom } from 'jotai';

import { createNullArrayOfLength } from '@leather.io/utils';

import { DATA_DERIVATION_PATH, deriveStacksSalt } from '@shared/crypto/stacks/stacks-address-gen';
import { defaultWalletKeyId } from '@shared/utils';

import { storeAtom } from '@app/store';
import { selectStacksChain } from '@app/store/chains/stx-chain.selectors';
import { selectRootKeychain } from '@app/store/in-memory-key/in-memory-key.selectors';
import { selectDefaultWalletStacksKeys } from '@app/store/ledger/stacks/stacks-key.slice';
import { getStacksNetworkFromChainId } from '@app/store/networks/networks.hooks';
import { selectCurrentNetwork } from '@app/store/networks/networks.selectors';

import type {
  HardwareStacksAccount,
  SoftwareStacksAccount,
  StacksAccount,
} from './stacks-account.models';

function initalizeStacksAccount(rootKeychain: HDKey, index: number) {
  const stxPrivateKey = deriveStxPrivateKey({ rootNode: rootKeychain, index } as any);
  const pubKey = privateKeyToPublic(stxPrivateKey) as string;

  const identitiesKeychain = rootKeychain.derive(DATA_DERIVATION_PATH);
  const identityKeychain = identitiesKeychain.deriveChild(index + HARDENED_OFFSET);
  if (!identityKeychain.privateKey) throw new Error('Must have private key to derive identities');
  const dataPrivateKey = bytesToHex(identityKeychain.privateKey);

  const appsKey = identityKeychain.deriveChild(0 + HARDENED_OFFSET).privateExtendedKey;

  const salt = deriveStacksSalt(identitiesKeychain);

  return {
    index,
    appsKey,
    dataPrivateKey,
    stxPrivateKey,
    publicKey: pubKey,
    salt,
    mainnetAddress: publicKeyToAddress(AddressVersion.MainnetSingleSig, pubKey),
    testnetAddress: publicKeyToAddress(AddressVersion.TestnetSingleSig, pubKey),
  };
}

const selectStacksWalletState = createSelector(
  selectRootKeychain,
  selectStacksChain,
  (keychain, chain) => {
    if (!keychain) return;
    const { highestAccountIndex, currentAccountIndex } = chain[defaultWalletKeyId];
    const numberOfAccountsToDerive = Math.max(highestAccountIndex, currentAccountIndex) + 1;
    return createNullArrayOfLength(numberOfAccountsToDerive).map((_, index) =>
      initalizeStacksAccount(keychain, index)
    );
  }
);

const softwareAccountsState = atom<SoftwareStacksAccount[] | undefined>(get => {
  const store = get(storeAtom);
  const currentNetwork = selectCurrentNetwork(get(storeAtom));

  const network =
    getStacksNetworkFromChainId(currentNetwork.chain.stacks.chainId) ||
    AddressVersion.TestnetSingleSig;
  const accounts = selectStacksWalletState(store);
  if (!accounts) return undefined;
  return accounts.map(account => {
    const address = publicKeyToAddressSingleSig(privateKeyToPublic(account.stxPrivateKey), network);
    const stxPublicKey = privateKeyToPublic(account.stxPrivateKey) as string;
    const dataPublicKey = privateKeyToPublic(account.dataPrivateKey) as string;
    return { ...account, type: 'software', address, stxPublicKey, dataPublicKey };
  });
});

const ledgerAccountsState = atom<HardwareStacksAccount[] | undefined>(get => {
  const currentNetwork = selectCurrentNetwork(get(storeAtom));

  const ledgerKeys = selectDefaultWalletStacksKeys(get(storeAtom));

  return ledgerKeys.map((publicKeys, index) => {
    const address = publicKeyToAddressSingleSig(
      createStacksPublicKey(publicKeys.stxPublicKey).data,
      getStacksNetworkFromChainId(currentNetwork.chain.stacks.chainId)
    );
    return {
      ...publicKeys,
      type: 'ledger',
      address,
      stxPublicKey: publicKeys.stxPublicKey,
      dataPublicKey: publicKeys.dataPublicKey,
      index,
    };
  });
});

export const stacksAccountState = atom<StacksAccount[]>(get => {
  const ledgerAccounts = get(ledgerAccountsState);
  const softwareAccounts = get(softwareAccountsState);

  if (ledgerAccounts?.length) {
    return ledgerAccounts;
  }

  return softwareAccounts ?? [];
});
