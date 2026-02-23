import { bytesToHex } from '@noble/hashes/utils';
import { createSelector } from '@reduxjs/toolkit';
import { HARDENED_OFFSET, HDKey } from '@scure/bip32';
import {
  createStacksPublicKey,
  privateKeyToPublic,
  publicKeyToAddressSingleSig,
} from '@stacks/transactions';
import { deriveStxPrivateKey } from '@stacks/wallet-sdk';
import { mapValues } from 'remeda';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import {
  extractFingerprintFromKeyOriginPath,
  extractKeyFromDescriptor,
  extractKeyOriginPathFromDescriptor,
} from '@leather.io/crypto';
import type { AccountId, NetworkModes } from '@leather.io/models';
import { makeStxKeyOrigin } from '@leather.io/stacks';
import { createNullArrayOfLength } from '@leather.io/utils';

import { DATA_DERIVATION_PATH, deriveStacksSalt } from '@shared/crypto/stacks/stacks-address-gen';
import { assumedZeroFingerprint } from '@shared/utils';

import type { StacksAppKeysResponseItem } from '@app/features/ledger/utils/stacks-ledger-utils';
import type { RootState } from '@app/store';
import { selectStacksChain } from '@app/store/chains/stx-chain.selectors';
import { selectRootKeychains } from '@app/store/in-memory-key/in-memory-key.selectors';
import { selectStacksKeychains } from '@app/store/keychains/keychain.selectors';
import { selectCurrentNetwork } from '@app/store/networks/networks.selectors';

import type { HardwareStacksAccount, SoftwareStacksAccount } from './stacks-account.models';

function initalizeSoftwareStacksAccount(
  rootKeychain: HDKey,
  accountId: AccountId,
  network: NetworkModes
): SoftwareStacksAccount {
  const stxPrivateKey = deriveStxPrivateKey({
    // Type assertion needed: @stacks/wallet-sdk uses @scure/bip32@1.1.3 while we use 1.6.2
    rootNode: rootKeychain as any,
    index: accountId.accountIndex,
  });

  const identitiesKeychain = rootKeychain.derive(DATA_DERIVATION_PATH);
  const identityKeychain = identitiesKeychain.deriveChild(accountId.accountIndex + HARDENED_OFFSET);
  if (!identityKeychain.privateKey) throw new Error('Must have private key to derive identities');
  const dataPrivateKey = bytesToHex(identityKeychain.privateKey);

  const appsKey = identityKeychain.deriveChild(0 + HARDENED_OFFSET).privateExtendedKey;
  const salt = deriveStacksSalt(identitiesKeychain);

  const stxPublicKey = privateKeyToPublic(stxPrivateKey) as string;
  const dataPublicKey = privateKeyToPublic(dataPrivateKey) as string;
  const address = publicKeyToAddressSingleSig(stxPublicKey, network);

  return {
    ...accountId,
    type: 'software',
    index: accountId.accountIndex,
    address,
    stxPublicKey,
    dataPublicKey,
    appsKey,
    dataPrivateKey,
    stxPrivateKey,
    salt,
  };
}

function initalizeHardwareStacksAccount(
  ledgerKeychain: StacksAppKeysResponseItem & { id: string; fingerprint: string },
  accountId: AccountId,
  network: NetworkModes
): HardwareStacksAccount {
  const address = publicKeyToAddressSingleSig(
    createStacksPublicKey(ledgerKeychain.stxPublicKey).data,
    network
  );

  return {
    type: 'ledger',
    address,
    index: accountId.accountIndex,
    ...ledgerKeychain,
    ...accountId,
  };
}

const selectSoftwareAccounts = createSelector(
  selectRootKeychains,
  selectStacksChain,
  selectCurrentNetwork,
  (keychains, chain, currentNetwork) => {
    if (!keychains) return [];

    const network = bitcoinNetworkModeToCoreNetworkMode(currentNetwork.chain.bitcoin.mode);

    return Object.entries(keychains).flatMap(([fingerprint, keychain]) => {
      const chainState = chain[fingerprint];
      if (!chainState) return [];

      const { highestAccountIndex } = chainState;
      const numberOfAccountsToDerive = highestAccountIndex + 1;

      return createNullArrayOfLength(numberOfAccountsToDerive).map((_, accountIndex) =>
        initalizeSoftwareStacksAccount(keychain, { fingerprint, accountIndex }, network)
      );
    });
  }
);

const selectLedgerAccounts = createSelector(
  selectCurrentNetwork,
  selectStacksKeychains,
  (currentNetwork, stacksKeychains) => {
    const network = bitcoinNetworkModeToCoreNetworkMode(currentNetwork.chain.bitcoin.mode);

    return stacksKeychains.map((keychain, index) => {
      const keyOrigin = extractKeyOriginPathFromDescriptor(keychain.descriptor);
      const fingerprint = extractFingerprintFromKeyOriginPath(keyOrigin) || assumedZeroFingerprint;
      const stxPublicKey = extractKeyFromDescriptor(keychain.descriptor);

      // Stacks ledger accounts also store dataPublicKey, but we don't have it in the keychain
      // For now, we'll use the stxPublicKey as a fallback
      const ledgerKeychain: StacksAppKeysResponseItem & { id: string; fingerprint: string } = {
        id: keyOrigin,
        path: keyOrigin,
        stxPublicKey,
        dataPublicKey: stxPublicKey,
        fingerprint,
      };

      return initalizeHardwareStacksAccount(
        ledgerKeychain,
        { fingerprint, accountIndex: index },
        network
      );
    });
  }
);

export const selectStacksAccountState = createSelector(
  selectLedgerAccounts,
  selectSoftwareAccounts,
  (ledgerAccounts, softwareAccounts): (SoftwareStacksAccount | HardwareStacksAccount)[] => [
    ...softwareAccounts,
    ...ledgerAccounts,
  ]
);

function memoizeAccountGenerator<
  TAccount extends SoftwareStacksAccount | HardwareStacksAccount | undefined,
>(
  fn: (accountId: AccountId, network: NetworkModes) => TAccount
): (accountId: AccountId, network: NetworkModes) => TAccount {
  const cache = new Map<string, TAccount>();

  return (accountId: AccountId, network: NetworkModes): TAccount => {
    const cacheKey = `${accountId.fingerprint}:${accountId.accountIndex}:${network}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;

    const result = fn(accountId, network);
    cache.set(cacheKey, result);
    return result;
  };
}

function createSoftwareStacksAccountGenerator(rootKeychain: HDKey) {
  function generateAccount(accountId: AccountId, network: NetworkModes): SoftwareStacksAccount {
    return initalizeSoftwareStacksAccount(rootKeychain, accountId, network);
  }
  return memoizeAccountGenerator(generateAccount);
}

const selectSoftwareStacksAccountGenerators = createSelector(selectRootKeychains, keychains => {
  if (!keychains) return {};
  return mapValues(keychains, keychain => createSoftwareStacksAccountGenerator(keychain));
});

function generateLedgerStacksAccount(
  ledgerKeys: Record<string, StacksAppKeysResponseItem & { id: string; fingerprint: string }>,
  accountId: AccountId,
  network: NetworkModes
): HardwareStacksAccount | undefined {
  const keyOrigin = makeStxKeyOrigin(accountId.fingerprint, accountId.accountIndex);
  const ledgerKeychain = ledgerKeys[keyOrigin];
  if (!ledgerKeychain) return undefined;
  return initalizeHardwareStacksAccount(ledgerKeychain, accountId, network);
}

const selectLedgerStacksAccountLookup = createSelector(selectStacksKeychains, stacksKeychains => {
  // Convert keychains to a Record format for lookup
  const ledgerKeys: Record<
    string,
    StacksAppKeysResponseItem & { id: string; fingerprint: string }
  > = {};

  stacksKeychains.forEach(keychain => {
    const keyOrigin = extractKeyOriginPathFromDescriptor(keychain.descriptor);
    const fingerprint = extractFingerprintFromKeyOriginPath(keyOrigin) || assumedZeroFingerprint;
    const stxPublicKey = extractKeyFromDescriptor(keychain.descriptor);

    ledgerKeys[keyOrigin] = {
      id: keyOrigin,
      path: keyOrigin,
      stxPublicKey,
      dataPublicKey: stxPublicKey,
      fingerprint,
    };
  });

  function generateAccount(accountId: AccountId, network: NetworkModes) {
    return generateLedgerStacksAccount(ledgerKeys, accountId, network);
  }
  return memoizeAccountGenerator(generateAccount);
});

const selectStacksAccountLookup = createSelector(
  selectSoftwareStacksAccountGenerators,
  selectLedgerStacksAccountLookup,
  (softwareGenerators, ledgerLookup) => (accountId: AccountId, network: NetworkModes) => {
    const softwareGenerator = softwareGenerators[accountId.fingerprint];
    if (softwareGenerator) return softwareGenerator(accountId, network);
    return ledgerLookup(accountId, network);
  }
);

export const selectStacksAccountById = createSelector(
  selectStacksAccountLookup,
  selectCurrentNetwork,
  (_state: RootState, accountId: AccountId) => accountId,
  (accountLookup, currentNetwork, accountId) => {
    return accountLookup(
      accountId,
      bitcoinNetworkModeToCoreNetworkMode(currentNetwork.chain.bitcoin.mode)
    );
  }
);
