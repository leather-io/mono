import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { selectNetwork } from '@/store/settings/settings.write';
import { createSelector } from '@reduxjs/toolkit';
import memoize from 'just-memoize';

import {
  bitcoinNetworkModeToCoreNetworkMode,
  deriveNativeSegWitReceiveAddressIndex,
  deriveTaprootReceiveAddressIndex,
  extractExtendedPublicKeyFromPolicy,
  inferNetworkFromPath,
  inferPaymentTypeFromPath,
} from '@leather.io/bitcoin';
import {
  extractDerivationPathFromDescriptor,
  extractFingerprintFromDescriptor,
  extractKeyOriginPathFromDescriptor,
} from '@leather.io/crypto';

import { descriptorKeychainSelectors, filterKeychainsByAccountIndex } from '../keychains';
import { bitcoinKeychainAdapter } from './bitcoin-keychains.write';

export const bitcoinKeychainSelectors = bitcoinKeychainAdapter.getSelectors(
  (state: RootState) => state.keychains.bitcoin
);

function initializeBitcoinKeychain(descriptor: string) {
  const derivationFn =
    inferPaymentTypeFromPath(extractDerivationPathFromDescriptor(descriptor)) === 'p2wpkh'
      ? deriveNativeSegWitReceiveAddressIndex
      : deriveTaprootReceiveAddressIndex;

  const result = {
    descriptor,
    fingerprint: extractFingerprintFromDescriptor(descriptor),
    ...derivationFn({
      xpub: extractExtendedPublicKeyFromPolicy(descriptor),
      network: inferNetworkFromPath(extractKeyOriginPathFromDescriptor(descriptor)),
    }),
  };
  return result;
}

const memoizedInitalizeBitcoinKeychain = memoize(initializeBitcoinKeychain);

const bitcoinKeychainList = createSelector(
  bitcoinKeychainSelectors.selectAll,
  selectNetwork,
  (accounts, network) =>
    accounts
      .filter(
        account =>
          inferNetworkFromPath(extractKeyOriginPathFromDescriptor(account.descriptor)) ===
          bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.bitcoinNetwork)
      )
      .map(account => memoizedInitalizeBitcoinKeychain(account.descriptor))
);

export function useBitcoinKeychains() {
  const list = useSelector(bitcoinKeychainList);
  return useMemo(() => descriptorKeychainSelectors(list, filterKeychainsByAccountIndex), [list]);
}
