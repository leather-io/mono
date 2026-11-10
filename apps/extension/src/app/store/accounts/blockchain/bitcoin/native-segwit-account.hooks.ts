import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';
import { type HDKey } from '@scure/bip32';
import { type Psbt } from 'bitcoinjs-lib';

import {
  deriveAddressIndexZeroFromAccount,
  deriveNativeSegwitAccountFromRootKeychain,
  getNativeSegwitPaymentFromAddressIndex,
} from '@leather.io/bitcoin';
import { type AccountId } from '@leather.io/models';
import { getMempoolApiClient } from '@leather.io/services';
import { reverseBytes } from '@leather.io/utils';

import { type BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { analytics } from '@shared/utils/analytics';

import { useInMemoryKeys } from '@app/store/in-memory-key/use-in-memory-keys';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { selectCurrentAccount } from '@app/store/software-keys/software-key.selectors';
import type { RootState } from '@app/store/store';

import { useCurrentAccountId } from '../../account';
import { selectCurrentNetworkBitcoinAccountLookup } from './bitcoin-keychain';
import { bitcoinSoftwarePayerFactory } from './bitcoin-payer';

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
  selectCurrentAccount,
  (accountLookup, currentAccount) => {
    return accountLookup(currentAccount.fingerprint)({
      paymentType: 'p2wpkh',
      accountIndex: currentAccount.accountIndex,
    });
  }
);

export function useCurrentNativeSegwitAccount() {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectCurrentNativeSegwitAccount(state, version));
}

export function useNativeSegwitAccount(accountId: AccountId) {
  const { version } = useInMemoryKeys();
  const lookupNativeSegwitAccount = useSelector((state: RootState) =>
    selectNativeSegwitAccountId(state, version)
  );
  return useMemo(
    () => lookupNativeSegwitAccount(accountId),
    [lookupNativeSegwitAccount, accountId]
  );
}

export function useNativeSegwitPayer(accountId: AccountId) {
  const account = useNativeSegwitAccount(accountId);
  const network = useCurrentNetwork();

  return useMemo(() => {
    if (!account) return;

    return bitcoinSoftwarePayerFactory({
      accountKeychain: account.keychain,
      accountKeyOrigin: account.keyOrigin,
      masterKeyFingerprint: account.masterKeyFingerprint,
      paymentFn: getNativeSegwitPaymentFromAddressIndex,
      network: network.chain.bitcoin.mode,
    });
  }, [account, network.chain.bitcoin.mode]);
}

export function useCurrentAccountNativeSegwitPayer() {
  const currentAccount = useCurrentAccountId();
  return useNativeSegwitPayer(currentAccount);
}

// TODO: as ledger users are able to have only stacks account on their devices,
// this hook throws an unnecessary error. To alleviate that, use
// useCurrentAccountNativeSegwitIndexZeroSignerNullable
export function useCurrentAccountNativeSegwitIndexZeroPayer() {
  const createPayer = useCurrentAccountNativeSegwitPayer();
  return useMemo(() => {
    if (!createPayer) throw new Error('No payer');
    return createPayer({ changeIndex: 0, addressIndex: 0 });
  }, [createPayer]);
}

export function useCurrentAccountNativeSegwitIndexZeroPayerNullable() {
  const createPayer = useCurrentAccountNativeSegwitPayer();
  return useMemo(() => {
    if (!createPayer) return undefined;
    return createPayer({ changeIndex: 0, addressIndex: 0 });
  }, [createPayer]);
}

/**
 * @deprecated Use payer.address instead
 */
export function useCurrentAccountNativeSegwitAddressIndexZero() {
  const createPayer = useCurrentAccountNativeSegwitPayer();
  return useMemo(
    () => createPayer?.({ changeIndex: 0, addressIndex: 0 }).payment.address ?? '',
    [createPayer]
  );
}

/**
 * @deprecated Use payer.address instead
 */
export function useNativeSegwitAccountIndexAddressIndexZero(accountId: AccountId) {
  const createPayer = useNativeSegwitPayer(accountId);
  const payer = createPayer?.({ changeIndex: 0, addressIndex: 0 });
  return payer?.payment.address ?? '';
}

export function getNativeSegwitMainnetAddressFromRootKeychain(rootKeychain: HDKey) {
  return (accountIndex: number) => {
    const account = deriveNativeSegwitAccountFromRootKeychain(
      rootKeychain,
      'mainnet'
    )(accountIndex);
    return getNativeSegwitPaymentFromAddressIndex(
      deriveAddressIndexZeroFromAccount(account.keychain),
      'mainnet'
    ).address;
  };
}

export function useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero() {
  return async (tx: Psbt, inputSigningConfig: BitcoinInputSigningConfig[]) => {
    const inputsTxHex = await Promise.all(
      tx.txInputs.map(async input => {
        const txHex: unknown = await getMempoolApiClient().fetchTransactionHex(
          // txids are encoded onchain in reverse byte order
          Buffer.from(reverseBytes(input.hash)).toString('hex')
        );
        if (typeof txHex !== 'string')
          throw new Error('Unexpected bitcoin transaction hex response');
        return txHex;
      })
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
