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
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { selectCurrentAccount } from '@app/store/software-keys/software-key.selectors';

import { useCurrentAccountId } from '../../account';
import {
  selectCurrentNetworkBitcoinAccountLookup,
  useBitcoinExtendedPublicKeyVersions,
} from './bitcoin-keychain';
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
  return useSelector(selectCurrentNativeSegwitAccount);
}

export function useNativeSegwitAccount(accountId: AccountId) {
  const lookupNativeSegwitAccount = useSelector(selectNativeSegwitAccountId);
  return useMemo(
    () => lookupNativeSegwitAccount(accountId),
    [lookupNativeSegwitAccount, accountId]
  );
}

export function useNativeSegwitPayer(accountId: AccountId) {
  const account = useNativeSegwitAccount(accountId);
  const network = useCurrentNetwork();
  const extendedPublicKeyVersions = useBitcoinExtendedPublicKeyVersions();

  return useMemo(() => {
    if (!account) return;

    return bitcoinSoftwarePayerFactory({
      accountKeychain: account.keychain,
      accountKeyOrigin: account.keyOrigin,
      masterKeyFingerprint: account.masterKeyFingerprint,
      paymentFn: getNativeSegwitPaymentFromAddressIndex,
      network: network.chain.bitcoin.mode,
      extendedPublicKeyVersions,
    });
  }, [account, extendedPublicKeyVersions, network.chain.bitcoin.mode]);
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
    () => createPayer?.({ changeIndex: 0, addressIndex: 0 }).payment.address,
    [createPayer]
  ) as string;
}

/**
 * @deprecated Use payer.address instead
 */
export function useNativeSegwitAccountIndexAddressIndexZero(accountId: AccountId) {
  const createPayer = useNativeSegwitPayer(accountId);
  const payer = createPayer?.({ changeIndex: 0, addressIndex: 0 });
  return payer?.payment.address as string;
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
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();

  return (tx: Psbt, fingerprint: string, inputSigningConfig: BitcoinInputSigningConfig[]) => {
    inputSigningConfig.forEach(({ index, derivationPath }) => {
      const nativeSegwitPayer = createNativeSegwitPayer?.({
        changeIndex: extractChangeIndexFromPath(derivationPath),
        addressIndex: extractAddressIndexFromPath(derivationPath),
      });

      if (!nativeSegwitPayer) throw new Error(`Unable to update input for path ${derivationPath}}`);

      // Coordinator PSBTs routinely populate bip32_derivation for every policy
      // key. Re-adding our key would hit bip174's by-pubkey dedupe and throw
      // "Can not add duplicate data to array", so skip when it is already present.
      const pubkey = Buffer.from(nativeSegwitPayer.publicKey);
      const hasDerivationForPubkey = tx.data.inputs[index].bip32Derivation?.some(entry =>
        entry.pubkey.equals(pubkey)
      );
      if (hasDerivationForPubkey) return;

      tx.updateInput(index, {
        bip32Derivation: [
          {
            masterFingerprint: Buffer.from(fingerprint, 'hex'),
            pubkey,
            path: derivationPath,
          },
        ],
      });
    });
  };
}
