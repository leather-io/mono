import { bytesToHex } from '@noble/hashes/utils';
import { createSelector } from '@reduxjs/toolkit';
import { HARDENED_OFFSET, HDKey } from '@scure/bip32';
import { AddressVersion } from '@stacks/network';
import {
  createStacksPublicKey,
  privateKeyToPublic,
  publicKeyToAddress,
  publicKeyToAddressSingleSig,
} from '@stacks/transactions';
import { deriveStxPrivateKey } from '@stacks/wallet-sdk';

import type { AccountId } from '@leather.io/models';
import { createNullArrayOfLength } from '@leather.io/utils';

import { DATA_DERIVATION_PATH, deriveStacksSalt } from '@shared/crypto/stacks/stacks-address-gen';

import { selectActiveAccount } from '@app/store/active/active.selectors';
import { selectStacksChain } from '@app/store/chains/stx-chain.selectors';
import { selectActiveWalletRootKeychain } from '@app/store/in-memory-key/in-memory-key.selectors';
import { selectDefaultWalletStacksKeys } from '@app/store/ledger/stacks/stacks-key.slice';
import { getStacksNetworkFromChainId } from '@app/store/networks/networks.hooks';
import { selectCurrentNetwork } from '@app/store/networks/networks.selectors';

import type { HardwareStacksAccount, SoftwareStacksAccount } from './stacks-account.models';

function initalizeStacksAccount(rootKeychain: HDKey, accountId: AccountId) {
  const stxPrivateKey = deriveStxPrivateKey({
    rootNode: rootKeychain,
    index: accountId.accountIndex,
  } as any);
  const pubKey = privateKeyToPublic(stxPrivateKey) as string;

  const identitiesKeychain = rootKeychain.derive(DATA_DERIVATION_PATH);
  const identityKeychain = identitiesKeychain.deriveChild(accountId.accountIndex + HARDENED_OFFSET);
  if (!identityKeychain.privateKey) throw new Error('Must have private key to derive identities');
  const dataPrivateKey = bytesToHex(identityKeychain.privateKey);

  const appsKey = identityKeychain.deriveChild(0 + HARDENED_OFFSET).privateExtendedKey;

  const salt = deriveStacksSalt(identitiesKeychain);

  return {
    ...accountId,
    appsKey,
    dataPrivateKey,
    stxPrivateKey,
    publicKey: pubKey,
    salt,
    mainnetAddress: publicKeyToAddress(AddressVersion.MainnetSingleSig, pubKey),
    testnetAddress: publicKeyToAddress(AddressVersion.TestnetSingleSig, pubKey),
  };
}

export function getCurrentWalletKeyFromChain(chainState: Record<string, any>): string {
  const keys = Object.keys(chainState);
  if (keys.length === 1) return keys[0];
  return 'default';
}

const selectStacksWalletState = createSelector(
  selectActiveWalletRootKeychain,
  selectActiveAccount,
  selectStacksChain,
  (keychain, account, chain) => {
    if (!keychain) return;
    const chainState = chain[account?.fingerprint ?? 'default'];
    if (!chainState) return;
    const { highestAccountIndex } = chainState;
    const numberOfAccountsToDerive = highestAccountIndex + 1;
    return createNullArrayOfLength(numberOfAccountsToDerive).map((_, index) =>
      initalizeStacksAccount(keychain, {
        fingerprint: account?.fingerprint ?? 'default',
        accountIndex: index,
      })
    );
  }
);

const selectSoftwareAccountsState = createSelector(
  selectCurrentNetwork,
  selectStacksWalletState,
  (currentNetwork, accounts) => {
    const network =
      getStacksNetworkFromChainId(currentNetwork.chain.stacks.chainId) ||
      AddressVersion.TestnetSingleSig;
    if (!accounts) return undefined;
    return accounts.map(account => {
      const address = publicKeyToAddressSingleSig(
        privateKeyToPublic(account.stxPrivateKey),
        network
      );
      const stxPublicKey = privateKeyToPublic(account.stxPrivateKey) as string;
      const dataPublicKey = privateKeyToPublic(account.dataPrivateKey) as string;
      return { ...account, type: 'software', address, stxPublicKey, dataPublicKey };
    }) satisfies SoftwareStacksAccount[] | undefined;
  }
);

const selectLedgerAccountsState = createSelector(
  selectCurrentNetwork,
  selectDefaultWalletStacksKeys,
  (currentNetwork, ledgerKeys) => {
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
    }) satisfies HardwareStacksAccount[] | undefined;
  }
);

export const selectStacksAccountState = createSelector(
  selectLedgerAccountsState,
  selectSoftwareAccountsState,
  (ledgerAccounts, softwareAccounts) => {
    if (ledgerAccounts?.length) {
      return ledgerAccounts;
    }
    return softwareAccounts ?? [];
  }
);
