import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';
import { Psbt } from 'bitcoinjs-lib';

import { ecdsaPublicKeyToSchnorr, getTaprootPaymentFromAddressIndex } from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import { type AccountId } from '@leather.io/models';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';

import type { RootState } from '@app/store';
import { useInMemoryKeys } from '@app/store/in-memory-key/use-in-memory-keys';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { selectCurrentAccount } from '@app/store/software-keys/software-key.selectors';

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
  selectCurrentAccount,
  (accountLookup, currentAccount) => {
    return accountLookup(currentAccount.fingerprint)({
      paymentType: 'p2tr',
      accountIndex: currentAccount.accountIndex,
    });
  }
);

export function useCurrentTaprootAccount() {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectCurrentTaprootAccount(state, version));
}

export function useTaprootAccount(accountId: AccountId) {
  const { version } = useInMemoryKeys();
  const lookupTaprootAccount = useSelector((state: RootState) =>
    selectTaprootAccountId(state, version)
  );
  return useMemo(() => lookupTaprootAccount(accountId), [lookupTaprootAccount, accountId]);
}

function useTaprootPayer(accountId: AccountId) {
  const account = useTaprootAccount(accountId);
  const network = useCurrentNetwork();
  const extendedPublicKeyVersions = useBitcoinExtendedPublicKeyVersions();

  return useMemo(() => {
    if (!account) return;

    return bitcoinSoftwarePayerFactory({
      accountKeychain: account.keychain,
      accountKeyOrigin: account.keyOrigin,
      masterKeyFingerprint: account.masterKeyFingerprint,
      paymentFn: getTaprootPaymentFromAddressIndex,
      network: network.chain.bitcoin.mode,
      extendedPublicKeyVersions,
    });
  }, [account, extendedPublicKeyVersions, network.chain.bitcoin.mode]);
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
