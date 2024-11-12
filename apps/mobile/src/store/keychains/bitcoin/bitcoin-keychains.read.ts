import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { selectNetworkPreference } from '@/store/settings/settings.read';
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

export const bitcoinKeychainSelectors = bitcoinKeychainAdapter.getSelectors(
  (state: RootState) => state.keychains.bitcoin
);

// These are expensive actions that may be called several times
const memoizedInitalizeBitcoinKeychain = memoize(initializeBitcoinAccountKeychainFromDescriptor);
const memoizedDriveBitcoinPayerFromAccount = memoize(
  (descriptor: string, network: BitcoinNetworkModes, addressIndex: number) =>
    deriveBitcoinPayerFromAccount(descriptor, network)({ addressIndex })
);

function deriveBitcoinPayersFromStore(keychains: BitcoinKeychain[], network: BitcoinNetworkModes) {
  console.log('deriveBitcoinPayersFromStore', keychains, network);
  return keychains
    .filter(
      keychain =>
        inferNetworkFromPath(extractKeyOriginPathFromDescriptor(keychain.descriptor)) ===
        bitcoinNetworkModeToCoreNetworkMode(network)
    )
    .map(keychain => ({
      ...memoizedInitalizeBitcoinKeychain(keychain.descriptor),
      // Performance optimization to aggressively memoize payer derivation
      derivePayer({ addressIndex }: BitcoinPayerInfo) {
        return memoizedDriveBitcoinPayerFromAccount(keychain.descriptor, network, addressIndex);
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
function splitByPaymentTypes<T extends BitcoinAccountKeychain>(accounts: T[]) {
  const nativeSegwit = accounts.find(
    account => inferPaymentTypeFromPath(account.keyOrigin) === 'p2wpkh'
  );

  const taproot = accounts.find(account => inferPaymentTypeFromPath(account.keyOrigin) === 'p2tr');
  if (!nativeSegwit || !taproot)
    throw new Error('It is always expected an account has both Taproot and Native Segwit');

  // Type hacking here to ensure easy DX when consuming different payment types
  return { nativeSegwit, taproot } as unknown as SplitByPaymentTypesReturn;
}

export function useBitcoinAccounts() {
  const list = useSelector(bitcoinKeychains);

  return useMemo(() => {
    const defaultSelectors = descriptorKeychainSelectors(list, filterKeychainsByAccountIndex);
    return {
      ...defaultSelectors,
      accountIndexByPaymentType(fingerprint: string, accountIndex: number) {
        return splitByPaymentTypes(defaultSelectors.fromAccountIndex(fingerprint, accountIndex));
      },
    };
  }, [list]);
}

export function useBitcoinPayerAddressFromAccountIndex(fingerprint: string, accountIndex: number) {
  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const taprootPayerAddress = taproot.derivePayer({ addressIndex: 0 }).address;
  const nativeSegwitPayerAddress = nativeSegwit.derivePayer({ addressIndex: 0 }).address;

  return { taprootPayerAddress, nativeSegwitPayerAddress };
}
