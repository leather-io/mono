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
} from './bitcoin-keychain';
import { bitcoinSoftwarePayerFactory } from './bitcoin-payer';

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

function useTaprootPayer(accountId: AccountId) {
  const account = useTaprootAccount(accountId);
  const network = useCurrentNetwork();
  const extendedPublicKeyVersions = useBitcoinExtendedPublicKeyVersions();

  return useMemo(() => {
    if (!account) return;

    return bitcoinSoftwarePayerFactory({
      accountIndex: accountId.accountIndex,
      accountKeychain: account.keychain,
      paymentFn: getTaprootPaymentFromAddressIndex,
      network: network.chain.bitcoin.mode,
      extendedPublicKeyVersions,
    });
  }, [account, accountId.accountIndex, extendedPublicKeyVersions, network.chain.bitcoin.mode]);
}

export function useCurrentAccountTaprootPayer() {
  const currentAccount = useCurrentAccountId();
  return useTaprootPayer(currentAccount);
}

export function useCurrentAccountTaprootIndexZeroPayer() {
  const payer = useCurrentAccountTaprootPayer();
  return useMemo(() => {
    if (!payer) throw new Error('No payer');
    return payer({ changeIndex: 0, addressIndex: 0 });
  }, [payer]);
}

export function useUpdateLedgerSpecificTaprootInputPropsForAdddressIndexZero() {
  const createTaprootPayer = useCurrentAccountTaprootPayer();

  return (tx: Psbt, fingerprint: string, inputsToUpdate: BitcoinInputSigningConfig[] = []) => {
    inputsToUpdate.forEach(({ index, derivationPath }) => {
      const taprootAddressIndexPayer = createTaprootPayer?.({
        changeIndex: extractChangeIndexFromPath(derivationPath),
        addressIndex: extractAddressIndexFromPath(derivationPath),
      });

      if (!taprootAddressIndexPayer)
        throw new Error(`Unable to update taproot input for path ${derivationPath}}`);

      tx.updateInput(index, {
        tapBip32Derivation: [
          {
            masterFingerprint: Buffer.from(fingerprint, 'hex'),
            pubkey: Buffer.from(ecdsaPublicKeyToSchnorr(taprootAddressIndexPayer.publicKey)),
            path: derivationPath,
            leafHashes: [],
          },
        ],
      });
    });
  };
}
