import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';
import { Psbt } from 'bitcoinjs-lib';

import { ecdsaPublicKeyToSchnorr, getTaprootPaymentFromAddressIndex } from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import { type AccountId } from '@leather.io/models';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';

import { selectActiveAccount } from '@app/store/active/active.selectors';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCurrentAccountId } from '../../account';
import {
  selectCurrentNetworkBitcoinAccountLookup,
  useBitcoinExtendedPublicKeyVersions,
  useBitcoinSigningCallbacksLookup,
} from './bitcoin-keychain';
import { bitcoinSoftwareSignerFactory } from './bitcoin-signer';

const selectTaprootAccountId = createSelector(
  selectCurrentNetworkBitcoinAccountLookup,
  accountLookup => (accountId: AccountId) =>
    accountLookup(accountId.fingerprint)({
      paymentType: 'p2tr',
      accountIndex: accountId.accountIndex,
    })
);

const selectCurrentTaprootAccount = createSelector(
  selectCurrentNetworkBitcoinAccountLookup,
  selectActiveAccount,
  (accountLookup, activeAccount) => {
    if (!activeAccount) return undefined;
    return accountLookup(activeAccount.fingerprint)({
      paymentType: 'p2tr',
      accountIndex: activeAccount.accountIndex,
    });
  }
);

export function useCurrentTaprootAccount() {
  return useSelector(selectCurrentTaprootAccount);
}

export function useTaprootAccount(accountId: AccountId) {
  const lookupTaprootAccount = useSelector(selectTaprootAccountId);
  return useMemo(() => lookupTaprootAccount(accountId), [lookupTaprootAccount, accountId]);
}

function useTaprootSigner(accountId: AccountId) {
  const account = useTaprootAccount(accountId);
  const network = useCurrentNetwork();
  const extendedPublicKeyVersions = useBitcoinExtendedPublicKeyVersions();
  const signingCallbacksLookup = useBitcoinSigningCallbacksLookup();

  return useMemo(() => {
    if (!account) return;
    const getSigningCallbacks = signingCallbacksLookup(accountId.fingerprint);
    if (!getSigningCallbacks) return;

    return bitcoinSoftwareSignerFactory({
      accountIndex: accountId.accountIndex,
      accountKeychain: account.keychain,
      paymentFn: getTaprootPaymentFromAddressIndex,
      network: network.chain.bitcoin.mode,
      extendedPublicKeyVersions,
      getSigningCallbacks: ({ changeIndex, addressIndex }) =>
        getSigningCallbacks({
          paymentType: 'p2tr',
          network: network.chain.bitcoin.mode,
          accountIndex: accountId.accountIndex,
          changeIndex,
          addressIndex,
        }),
    });
  }, [
    account,
    accountId.accountIndex,
    accountId.fingerprint,
    extendedPublicKeyVersions,
    network.chain.bitcoin.mode,
    signingCallbacksLookup,
  ]);
}

export function useCurrentAccountTaprootSigner() {
  const currentAccount = useCurrentAccountId();
  return useTaprootSigner(currentAccount);
}

export function useCurrentAccountTaprootIndexZeroSigner() {
  const signer = useCurrentAccountTaprootSigner();
  return useMemo(() => {
    if (!signer) throw new Error('No signer');
    return signer({ changeIndex: 0, addressIndex: 0 });
  }, [signer]);
}

export function useUpdateLedgerSpecificTaprootInputPropsForAdddressIndexZero() {
  const createTaprootSigner = useCurrentAccountTaprootSigner();

  return (tx: Psbt, fingerprint: string, inputsToUpdate: BitcoinInputSigningConfig[] = []) => {
    inputsToUpdate.forEach(({ index, derivationPath }) => {
      const taprootAddressIndexSigner = createTaprootSigner?.({
        changeIndex: extractChangeIndexFromPath(derivationPath),
        addressIndex: extractAddressIndexFromPath(derivationPath),
      });

      if (!taprootAddressIndexSigner)
        throw new Error(`Unable to update taproot input for path ${derivationPath}}`);

      tx.updateInput(index, {
        tapBip32Derivation: [
          {
            masterFingerprint: Buffer.from(fingerprint, 'hex'),
            pubkey: Buffer.from(ecdsaPublicKeyToSchnorr(taprootAddressIndexSigner.publicKey)),
            path: derivationPath,
            leafHashes: [],
          },
        ],
      });
    });
  };
}
