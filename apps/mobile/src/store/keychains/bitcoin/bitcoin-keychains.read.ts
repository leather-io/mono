import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { selectNetworkPreference } from '@/store/settings/settings.read';
import { destructAccountIdentifier } from '@/store/utils';
import { useWallets } from '@/store/wallets/wallets.read';
import { createSelector } from '@reduxjs/toolkit';
import memoize from 'just-memoize';

import {
  BitcoinAccountKeychain,
  BitcoinNativeSegwitPayer,
  BitcoinPayerInfo,
  BitcoinTaprootPayer,
  WithDerivePayer,
  bitcoinNetworkModeToCoreNetworkMode,
  deriveBitcoinPayerFromAccount,
  inferNetworkFromPath,
  inferPaymentTypeFromPath,
  initializeBitcoinAccountKeychainFromDescriptor,
} from '@leather.io/bitcoin';
import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';
import { BitcoinNetworkModes, bitcoinNetworkToNetworkMode } from '@leather.io/models';

import { descriptorKeychainSelectors, filterKeychainsByAccountIndex } from '../keychains';
import { bitcoinKeychainAdapter } from './bitcoin-keychains.write';
import { BitcoinKeychain } from './utils';

const bitcoinKeychainSelectors = bitcoinKeychainAdapter.getSelectors(
  (state: RootState) => state.keychains.bitcoin
);

// These are expensive actions that may be called several times
const memoizedInitalizeBitcoinKeychain = memoize(initializeBitcoinAccountKeychainFromDescriptor);
const memoizedDriveBitcoinPayerFromAccount = memoize(
  (descriptor: string, network: BitcoinNetworkModes, change: number, addressIndex: number) =>
    deriveBitcoinPayerFromAccount(descriptor, network)({ change, addressIndex })
);

function deriveBitcoinPayersFromStore(keychains: BitcoinKeychain[], network: BitcoinNetworkModes) {
  return keychains
    .filter(
      keychain =>
        inferNetworkFromPath(extractKeyOriginPathFromDescriptor(keychain.descriptor)) ===
        bitcoinNetworkModeToCoreNetworkMode(network)
    )
    .map(keychain => ({
      ...memoizedInitalizeBitcoinKeychain(keychain.descriptor),
      // Performance optimization to aggressively memoize payer derivation
      derivePayer({ change, addressIndex }: BitcoinPayerInfo) {
        return memoizedDriveBitcoinPayerFromAccount(
          keychain.descriptor,
          network,
          change,
          addressIndex
        );
      },
    }));
}

const bitcoinKeychains = createSelector(
  bitcoinKeychainSelectors.selectAll,
  selectNetworkPreference,
  (keychains, network) =>
    deriveBitcoinPayersFromStore(
      keychains,
      bitcoinNetworkToNetworkMode(network.chain.bitcoin.bitcoinNetwork)
    )
);

interface SplitByPaymentTypesReturn {
  nativeSegwit: WithDerivePayer<BitcoinAccountKeychain, BitcoinNativeSegwitPayer>;
  taproot: WithDerivePayer<BitcoinAccountKeychain, BitcoinTaprootPayer>;
}

function isTaprootAccount(account: BitcoinAccountKeychain) {
  return inferPaymentTypeFromPath(account.keyOrigin) === 'p2tr';
}

function isNativeSegwitAccount(account: BitcoinAccountKeychain) {
  return inferPaymentTypeFromPath(account.keyOrigin) === 'p2wpkh';
}

function splitByPaymentTypes<T extends BitcoinAccountKeychain>(accounts: T[]) {
  const nativeSegwit = accounts.find(isNativeSegwitAccount);

  const taproot = accounts.find(isTaprootAccount);

  if (!nativeSegwit || !taproot)
    throw new Error('It is always expected an account has both Taproot and Native Segwit');

  // Type hacking here to ensure easy DX when consuming different payment types
  return { nativeSegwit, taproot } as unknown as SplitByPaymentTypesReturn;
}

export function useBitcoinAccounts() {
  const { hasWallets } = useWallets();
  const list = useSelector(bitcoinKeychains);

  return useMemo(() => {
    if (!hasWallets)
      return {
        list: [],
        hasWallets,
        accountIndexByPaymentType: () => ({ nativeSegwit: null, taproot: null }),
        accountIdByPaymentType: () => ({ nativeSegwit: null, taproot: null }),
        fromAccountIndex: () => [],
        fromFingerprint: () => [],
        fromFingerprintAndAccountIndex: () => [],
      };
    const defaultSelectors = descriptorKeychainSelectors(list, filterKeychainsByAccountIndex);
    function accountIndexByPaymentType(fingerprint: string, accountIndex: number) {
      return splitByPaymentTypes(defaultSelectors.fromAccountIndex(fingerprint, accountIndex));
    }
    function accountIdByPaymentType(accountId: string) {
      const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
      return accountIndexByPaymentType(fingerprint, accountIndex);
    }
    return {
      ...defaultSelectors,
      accountIndexByPaymentType,
      accountIdByPaymentType,
    };
  }, [list, hasWallets]);
}

export function useBitcoinPayerAddressFromAccountIndex(fingerprint: string, accountIndex: number) {
  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const taprootPayerAddress = taproot?.derivePayer({ change: 0, addressIndex: 0 }).address ?? '';
  const nativeSegwitPayerAddress =
    nativeSegwit?.derivePayer({ change: 0, addressIndex: 0 }).address ?? '';

  return { taprootPayerAddress, nativeSegwitPayerAddress };
}

export function useBitcoinAddresses() {
  const { list: accounts } = useBitcoinAccounts();
  return useMemo(
    () =>
      accounts
        .map(keychain => keychain.derivePayer({ change: 0, addressIndex: 0 }))
        .map(a => a.address),
    [accounts]
  );
}

export function findAccountByAddress(
  accounts: ReturnType<typeof useBitcoinAccounts>['list'],
  address: string,
  addressIndex = 0
) {
  return accounts.find(
    keychain => keychain.derivePayer({ change: 0, addressIndex }).address === address
  );
}
