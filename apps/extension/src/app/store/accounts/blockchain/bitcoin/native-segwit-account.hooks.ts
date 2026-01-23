import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';
import { Psbt } from 'bitcoinjs-lib';

import {
  deriveAddressIndexZeroFromAccount,
  deriveNativeSegwitAccountFromRootKeychain,
  getNativeSegwitPaymentFromAddressIndex,
} from '@leather.io/bitcoin';
import {
  deriveRootKeychainFromMnemonicSync,
  extractAddressIndexFromPath,
  extractChangeIndexFromPath,
} from '@leather.io/crypto';
import { type AccountId } from '@leather.io/models';
import { reverseBytes } from '@leather.io/utils';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { analytics } from '@shared/utils/analytics';

import { useBitcoinClient } from '@app/query/bitcoin/clients/bitcoin-client';
import { selectActiveAccount } from '@app/store/active/active.selectors';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCurrentAccountId } from '../../account';
import {
  selectCurrentNetworkBitcoinAccountLookup,
  useBitcoinExtendedPublicKeyVersions,
  useBitcoinSigningCallbacksLookup,
} from './bitcoin-keychain';
import { bitcoinSoftwareSignerFactory } from './bitcoin-signer';

const selectNativeSegwitAccountId = createSelector(
  selectCurrentNetworkBitcoinAccountLookup,
  accountLookup => (accountId: AccountId) =>
    accountLookup(accountId.fingerprint)({
      paymentType: 'p2wpkh',
      accountIndex: accountId.accountIndex,
    })
);

const selectCurrentNativeSegwitAccount = createSelector(
  selectCurrentNetworkBitcoinAccountLookup,
  selectActiveAccount,
  (accountLookup, activeAccount) => {
    if (!activeAccount) return undefined;
    return accountLookup(activeAccount.fingerprint)({
      paymentType: 'p2wpkh',
      accountIndex: activeAccount.accountIndex,
    });
  }
);

export function useCurrentNativeSegwitAccount() {
  return useSelector(selectCurrentNativeSegwitAccount);
}

export function useNativeSegwitAccount(accountId: AccountId) {
  const lookupNativeSegwitAccount = useSelector(selectNativeSegwitAccountId);
  return useMemo(
    () => lookupNativeSegwitAccount(accountId),
    [lookupNativeSegwitAccount, accountId]
  );
}

export function useNativeSegwitSigner(accountId: AccountId) {
  const account = useNativeSegwitAccount(accountId);
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
      paymentFn: getNativeSegwitPaymentFromAddressIndex,
      network: network.chain.bitcoin.mode,
      extendedPublicKeyVersions,
      getSigningCallbacks: ({ changeIndex, addressIndex }) =>
        getSigningCallbacks({
          paymentType: 'p2wpkh',
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

export function useCurrentAccountNativeSegwitSigner() {
  const currentAccount = useCurrentAccountId();
  return useNativeSegwitSigner(currentAccount);
}

// TODO: as ledger users are able to have only stacks account on their devices,
// this hook throws an unnecessary error. To alleviate that, use
// useCurrentAccountNativeSegwitIndexZeroSignerNullable
export function useCurrentAccountNativeSegwitIndexZeroSigner() {
  const signer = useCurrentAccountNativeSegwitSigner();
  return useMemo(() => {
    if (!signer) throw new Error('No signer');
    return signer({ changeIndex: 0, addressIndex: 0 });
  }, [signer]);
}

export function useCurrentAccountNativeSegwitIndexZeroSignerNullable() {
  const signer = useCurrentAccountNativeSegwitSigner();
  return useMemo(() => {
    if (!signer) return undefined;
    return signer({ changeIndex: 0, addressIndex: 0 });
  }, [signer]);
}

/**
 * @deprecated Use signer.address instead
 */
export function useCurrentAccountNativeSegwitAddressIndexZero() {
  const signer = useCurrentAccountNativeSegwitSigner();
  return useMemo(
    () => signer?.({ changeIndex: 0, addressIndex: 0 }).payment.address,
    [signer]
  ) as string;
}

/**
 * @deprecated Use signer.address instead
 */
export function useNativeSegwitAccountIndexAddressIndexZero(accountId: AccountId) {
  const signer = useNativeSegwitSigner(accountId)?.({ changeIndex: 0, addressIndex: 0 });
  return signer?.payment.address as string;
}

export function getNativeSegwitMainnetAddressFromMnemonic(secretKey: string) {
  return (accountIndex: number) => {
    const rootNode = deriveRootKeychainFromMnemonicSync(secretKey);
    const account = deriveNativeSegwitAccountFromRootKeychain(rootNode, 'mainnet')(accountIndex);
    return getNativeSegwitPaymentFromAddressIndex(
      deriveAddressIndexZeroFromAccount(account.keychain),
      'mainnet'
    );
  };
}

export function useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero() {
  const bitcoinClient = useBitcoinClient();

  return async (tx: Psbt, inputSigningConfig: BitcoinInputSigningConfig[]) => {
    const inputsTxHex = await Promise.all(
      tx.txInputs.map(input =>
        bitcoinClient.transactionsApi.getBitcoinTransactionHex(
          // txids are encoded onchain in reverse byte order
          reverseBytes(input.hash).toString('hex')
        )
      )
    );

    inputSigningConfig.forEach(({ index }) => {
      if (!tx.data.inputs[index].nonWitnessUtxo) {
        tx.updateInput(index, {
          nonWitnessUtxo: Buffer.from(inputsTxHex[index], 'hex'),
        });
        analytics.track('ledger_nativesegwit_add_nonwitnessutxo', {
          action: 'add_nonwitness_utxo',
        });
      } else {
        analytics.track('ledger_nativesegwit_add_nonwitnessutxo', {
          action: 'skip_add_nonwitness_utxo',
        });
      }
    });
  };
}

export function useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero() {
  const createNativeSegwitSigner = useCurrentAccountNativeSegwitSigner();

  return (tx: Psbt, fingerprint: string, inputSigningConfig: BitcoinInputSigningConfig[]) => {
    inputSigningConfig.forEach(({ index, derivationPath }) => {
      const nativeSegwitSigner = createNativeSegwitSigner?.({
        changeIndex: extractChangeIndexFromPath(derivationPath),
        addressIndex: extractAddressIndexFromPath(derivationPath),
      });

      if (!nativeSegwitSigner)
        throw new Error(`Unable to update input for path ${derivationPath}}`);

      tx.updateInput(index, {
        bip32Derivation: [
          {
            masterFingerprint: Buffer.from(fingerprint, 'hex'),
            pubkey: Buffer.from(nativeSegwitSigner.publicKey),
            path: derivationPath,
          },
        ],
      });
    });
  };
}
