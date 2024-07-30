import { useSelector } from 'react-redux';

import { userAddsAccount } from '@/state/accounts/accounts.slice';
import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '@/state/global-action';
import { selectNetwork } from '@/state/settings/settings.slice';
import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
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
  extractKeyOriginPathFromDescriptor,
} from '@leather.io/crypto';
import { ensureArray } from '@leather.io/utils';

import type { RootState } from '../..';
import { handleEntityActionWith, useAppDispatch } from '../../utils';
import {
  filterKeychainsByAccountIndex,
  filterKeychainsByFingerprint,
  filterKeychainsToRemove,
} from '../keychains';

export interface BitcoinKeychainStore {
  descriptor: string;
}
const adapter = createEntityAdapter<BitcoinKeychainStore, string>({
  selectId: account => extractKeyOriginPathFromDescriptor(account.descriptor),
});

const initialState = adapter.getInitialState();

export const bitcoinKeychainSlice = createSlice({
  name: 'bitcoin',
  initialState,
  reducers: {
    userAddsNewBitcoinAccount: adapter.addMany,
  },
  extraReducers: builder =>
    builder
      .addCase(
        userAddsWallet,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains?.bitcoin ?? [])
      )

      .addCase(
        userAddsAccount,
        handleEntityActionWith(adapter.addMany, payload => payload.withKeychains?.bitcoin ?? [])
      )

      .addCase(userRemovesWallet, filterKeychainsToRemove(adapter.removeMany))

      .addCase(...handleAppResetWithState(initialState)),
});

export const { userAddsNewBitcoinAccount } = bitcoinKeychainSlice.actions;

export const bitcoinKeychainSelectors = adapter.getSelectors(
  (state: RootState) => state.keychains.bitcoin
);

function initializeBitcoinKeychain(descriptor: string) {
  const derivationFn =
    inferPaymentTypeFromPath(extractDerivationPathFromDescriptor(descriptor)) === 'p2wpkh'
      ? deriveNativeSegWitReceiveAddressIndex
      : deriveTaprootReceiveAddressIndex;

  const result = {
    descriptor,
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
  const dispatch = useAppDispatch();

  const list = useSelector(bitcoinKeychainList);
  const entities = useSelector(bitcoinKeychainSelectors.selectEntities);

  return {
    list,
    getKeychainById(keyOrigin: string) {
      const key = entities[keyOrigin];
      if (!key) return null;
      return memoizedInitalizeBitcoinKeychain(key.descriptor);
    },
    fromFingerprint(fingerprint: string) {
      return list.filter(filterKeychainsByFingerprint(fingerprint));
    },
    fromAccountIndex(fingerprint: string, accountIndex: number) {
      return this.fromFingerprint(fingerprint).filter(filterKeychainsByAccountIndex(accountIndex));
    },
    add(account: BitcoinKeychainStore | BitcoinKeychainStore[]) {
      return dispatch(userAddsNewBitcoinAccount(ensureArray(account)));
    },
  };
}
