import { keychainSelectors } from '@/store/keychains/keychains.read';
import { store } from '@/store/store';
import { createStacksPublicKey, publicKeyToAddressSingleSig } from '@stacks/transactions';

import {
  extractAccountIndexFromDescriptor,
  extractFingerprintFromDescriptor,
  extractKeyFromDescriptor,
} from '@leather.io/crypto';
import { extractStacksDerivationPathAccountIndex } from '@leather.io/stacks';

import { type AccountDirectory, type WalletAccount } from './e2e-state';

interface StacksAccount extends WalletAccount {
  addresses: string[];
}

const stacksAddressCache = new Map<string, string[]>();

function readStacksAddresses(descriptor: string) {
  const cached = stacksAddressCache.get(descriptor);
  if (cached) return cached;
  const publicKey = createStacksPublicKey(extractKeyFromDescriptor(descriptor)).data;
  const addresses = [
    publicKeyToAddressSingleSig(publicKey, 'mainnet'),
    publicKeyToAddressSingleSig(publicKey, 'testnet'),
  ];
  stacksAddressCache.set(descriptor, addresses);
  return addresses;
}

function readWalletFingerprints() {
  return store.getState().wallets.ids.map(id => String(id).toLowerCase());
}

function readStacksAccounts(): StacksAccount[] {
  const fingerprints = readWalletFingerprints();
  return keychainSelectors
    .selectAll(store.getState())
    .filter(keychain => keychain.chain === 'stacks')
    .flatMap(keychain => {
      try {
        const walletIndex = fingerprints.indexOf(
          extractFingerprintFromDescriptor(keychain.descriptor).toLowerCase()
        );
        if (walletIndex < 0) return [];
        return [
          {
            walletIndex,
            accountIndex: extractStacksDerivationPathAccountIndex(keychain.descriptor),
            addresses: readStacksAddresses(keychain.descriptor),
          },
        ];
      } catch {
        return [];
      }
    });
}

function readBitcoinAccount(extendedPublicKey: string): WalletAccount | null {
  const fingerprints = readWalletFingerprints();
  const keychain = keychainSelectors
    .selectAll(store.getState())
    .find(({ chain, descriptor }) => chain === 'bitcoin' && descriptor.endsWith(extendedPublicKey));
  if (!keychain) return null;
  try {
    const walletIndex = fingerprints.indexOf(
      extractFingerprintFromDescriptor(keychain.descriptor).toLowerCase()
    );
    if (walletIndex < 0) return null;
    return { walletIndex, accountIndex: extractAccountIndexFromDescriptor(keychain.descriptor) };
  } catch {
    return null;
  }
}

export const storeAccountDirectory: AccountDirectory = {
  bitcoinAccountOf: readBitcoinAccount,
  stacksAccountOf(address) {
    const account = readStacksAccounts().find(({ addresses }) => addresses.includes(address));
    return account
      ? { walletIndex: account.walletIndex, accountIndex: account.accountIndex }
      : null;
  },
};
