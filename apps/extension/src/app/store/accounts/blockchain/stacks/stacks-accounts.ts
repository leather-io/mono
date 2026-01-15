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
import { deriveStxPrivateKey, generateWallet } from '@stacks/wallet-sdk';
import { atom } from 'jotai';

import { extractAccountIndexFromPath, extractAddressIndexFromPath } from '@leather.io/crypto';
import { makeStacksAccountDerivationPath } from '@leather.io/stacks';
import { createNullArrayOfLength } from '@leather.io/utils';

import { DATA_DERIVATION_PATH, deriveStacksSalt } from '@shared/crypto/stacks/stacks-address-gen';
import { defaultWalletKeyId } from '@shared/utils';

import { storeAtom } from '@app/store';
import { selectStacksChain } from '@app/store/chains/stx-chain.selectors';
import {
  selectDefaultWalletKey,
  selectRootKeychain,
} from '@app/store/in-memory-key/in-memory-key.selectors';
import { selectDefaultWalletStacksKeys } from '@app/store/ledger/stacks/stacks-key.slice';
import { currentNetworkAtom } from '@app/store/networks/networks';
import { getStacksNetworkFromChainId } from '@app/store/networks/networks.hooks';
import type { StacksAccountDerivationPreference } from '@app/store/settings/settings.slice';

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

const stacksAddressNetworkState = atom(get => {
  const currentNetwork = get(currentNetworkAtom);
  return getStacksNetworkFromChainId(currentNetwork.chain.stacks.chainId);
});

function shouldIncludeLedgerAccount(path: string, preference: StacksAccountDerivationPreference) {
  const accountIndex = extractAccountIndexFromPath(path);
  const addressIndex = extractAddressIndexFromPath(path);

  if (accountIndex === 0 && addressIndex === 0) {
    return true;
  }

  if (preference === 'stacks') {
    return accountIndex === 0 && addressIndex > 0;
  }

  return accountIndex > 0 && addressIndex === 0;
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
  const network = get(stacksAddressNetworkState) || AddressVersion.TestnetSingleSig;
  const accounts = selectStacksWalletState(store);
  if (!accounts) return undefined;
  return accounts.map(account => {
    const address = publicKeyToAddressSingleSig(privateKeyToPublic(account.stxPrivateKey), network);
    const stxPublicKey = privateKeyToPublic(account.stxPrivateKey) as string;
    const dataPublicKey = privateKeyToPublic(account.dataPrivateKey) as string;
    const path = makeStacksAccountDerivationPath(account.index);
    return { ...account, type: 'software', address, stxPublicKey, dataPublicKey, path };
  });
});

const ledgerAccountsState = atom<HardwareStacksAccount[] | undefined>(get => {
  const store = get(storeAtom);
  const network = get(stacksAddressNetworkState);
  const ledgerKeys = selectDefaultWalletStacksKeys(store);
  const preference = store.settings.stacksAccountDerivationPreference ?? 'stacks';

  const filteredKeys = ledgerKeys.filter(key => shouldIncludeLedgerAccount(key.path, preference));

  const sortedKeys = filteredKeys.sort((a, b) => {
    const aAccountIndex = extractAccountIndexFromPath(a.path);
    const aAddressIndex = extractAddressIndexFromPath(a.path);
    const bAccountIndex = extractAccountIndexFromPath(b.path);
    const bAddressIndex = extractAddressIndexFromPath(b.path);

    if (aAccountIndex === 0 && aAddressIndex === 0) return -1;
    if (bAccountIndex === 0 && bAddressIndex === 0) return 1;

    const aIndex = Math.max(aAccountIndex, aAddressIndex);
    const bIndex = Math.max(bAccountIndex, bAddressIndex);
    return aIndex - bIndex;
  });

  return sortedKeys.map((publicKeys, index) => {
    const address = publicKeyToAddressSingleSig(
      createStacksPublicKey(publicKeys.stxPublicKey).data,
      network
    );
    return {
      ...publicKeys,
      type: 'ledger',
      address,
      stxPublicKey: publicKeys.stxPublicKey,
      dataPublicKey: publicKeys.dataPublicKey,
      path: publicKeys.path,
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

/**
 * @deprecated
 * This method mocks the `Wallet` type from `@stacks/wallet-sdk`. Internally,
 * this library makes assumptions about how we want to use it. Such as
 * requesting BNS names (1 request per account). If you have many accounts, this
 * adds a huge loading time and stalls the wallet. Some parts of the code rely
 * on the `Wallet` type still, so here we mock it by manipulating it directly
 * (sans unwanted http requests).
 */
export const legacyStackWallet = atom(async get => {
  const store = get(storeAtom);
  const secretKey = selectDefaultWalletKey(store);
  const accounts = get(softwareAccountsState);
  if (!secretKey) return;
  const wallet = await generateWallet({ secretKey, password: '' });
  wallet.accounts = accounts ?? [];
  return wallet;
});
