import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { selectNetworkPreference } from '@/store/settings/settings.read';
import { destructAccountIdentifier } from '@/store/utils';
import {
  selectReadonlyWalletFingerprints,
  useReadonlyWalletFingerprints,
  useWallets,
} from '@/store/wallets/wallets.read';
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
import {
  extractAccountPathFromFullPath,
  extractAddressIndexFromPath,
  extractChangeIndexFromPath,
  extractFingerprintFromDescriptor,
  extractKeyOriginPathFromDescriptor,
  validateKeyOriginPath,
} from '@leather.io/crypto';
import { BitcoinNetworkModes, bitcoinNetworkToNetworkMode } from '@leather.io/models';

import { descriptorKeychainSelectors, filterKeychainsByAccountIndex } from '../keychains';
import { bitcoinKeychainAdapter } from './bitcoin-keychains.write';

const bitcoinKeychainSelectors = bitcoinKeychainAdapter.getSelectors(
  (state: RootState) => state.keychains.bitcoin
);

// These are expensive actions that may be called several times
const memoizedInitalizeBitcoinKeychain = memoize(initializeBitcoinAccountKeychainFromDescriptor);
const memoizedDriveBitcoinPayerFromAccount = memoize(
  (descriptor: string, network: BitcoinNetworkModes, change: number, addressIndex: number) =>
    deriveBitcoinPayerFromAccount(descriptor, network)({ change, addressIndex })
);

const selectBitcoinKeychains = createSelector(
  bitcoinKeychainSelectors.selectAll,
  selectReadonlyWalletFingerprints,
  selectNetworkPreference,
  (keychains, readonlyWalletFingerprints, network) => {
    const networkMode = bitcoinNetworkToNetworkMode(network.chain.bitcoin.bitcoinNetwork);
    return keychains
      .filter(
        keychain =>
          inferNetworkFromPath(extractKeyOriginPathFromDescriptor(keychain.descriptor)) ===
          bitcoinNetworkModeToCoreNetworkMode(networkMode)
      )
      .map(keychain => ({
        isReadonly: readonlyWalletFingerprints.includes(
          extractFingerprintFromDescriptor(keychain.descriptor)
        ),
        ...memoizedInitalizeBitcoinKeychain(keychain.descriptor),
        // Performance optimization to aggressively memoize payer derivation
        derivePayer({ change, addressIndex }: BitcoinPayerInfo) {
          return memoizedDriveBitcoinPayerFromAccount(
            keychain.descriptor,
            networkMode,
            change,
            addressIndex
          ) as BitcoinNativeSegwitPayer | BitcoinTaprootPayer;
        },
      }));
  }
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

export function splitByPaymentTypes<T extends BitcoinAccountKeychain>(
  accounts: T[],
  isReadonlyWallet: boolean
) {
  const nativeSegwit = accounts.find(isNativeSegwitAccount);

  const taproot = accounts.find(isTaprootAccount);

  if (!nativeSegwit || !taproot) {
    if (isReadonlyWallet) return { nativeSegwit: null, taproot: null };

    throw new Error('It is always expected an account has both Taproot and Native Segwit');
  }

  // Type hacking here to ensure easy DX when consuming different payment types
  return { nativeSegwit, taproot } as unknown as SplitByPaymentTypesReturn;
}

export function useBitcoinAccounts() {
  const { hasWallets } = useWallets();
  const readonlyWalletFingerprints = useReadonlyWalletFingerprints();
  const bitcoinKeychains = useSelector(selectBitcoinKeychains);

  return useMemo(() => {
    if (!hasWallets)
      return {
        list: [],
        hasWallets,
        accountIndexByPaymentType: () => ({ nativeSegwit: null, taproot: null }),
        accountIdByPaymentType: () => ({ nativeSegwit: null, taproot: null }),
        fromAccountIndex: () => [],
        fromFingerprint: () => [],
      };
    const defaultSelectors = descriptorKeychainSelectors(
      bitcoinKeychains,
      filterKeychainsByAccountIndex
    );
    function accountIndexByPaymentType(fingerprint: string, accountIndex: number) {
      return splitByPaymentTypes(
        defaultSelectors.fromAccountIndex(fingerprint, accountIndex),
        readonlyWalletFingerprints.includes(fingerprint)
      );
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
  }, [bitcoinKeychains, hasWallets, readonlyWalletFingerprints]);
}

export function useBitcoinPayerAddressFromAccountIndex(fingerprint: string, accountIndex: number) {
  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const taprootPayerAddress = taproot?.derivePayer({ change: 0, addressIndex: 0 }).address;
  const nativeSegwitPayerAddress = nativeSegwit?.derivePayer({
    change: 0,
    addressIndex: 0,
  }).address;

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

export type PayerLookupFn = (
  keyOrigin: string
) => BitcoinNativeSegwitPayer | BitcoinTaprootPayer | undefined;

export function useBitcoinPayerFromKeyOrigin(): PayerLookupFn {
  const { list: accounts } = useBitcoinAccounts();

  return useCallback(
    (keyOrigin: string) => {
      validateKeyOriginPath(keyOrigin);

      const change = extractChangeIndexFromPath(keyOrigin);
      const addressIndex = extractAddressIndexFromPath(keyOrigin);

      const baseKeyOrigin = extractAccountPathFromFullPath(keyOrigin);
      const account = accounts.find(keychain => keychain.keyOrigin === baseKeyOrigin);

      if (!account) return undefined;

      return account.derivePayer({ change, addressIndex });
    },
    [accounts]
  );
}
