import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';
import { HDKey, Versions } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { mapValues } from 'remeda';

import {
  type SupportedPaymentType,
  bitcoinNetworkModeToCoreNetworkMode,
  deriveAddressIndexKeychainFromAccount,
  getBtcSignerLibNetworkConfigByMode,
  getHdKeyVersionsFromNetwork,
  initializeBitcoinAccountKeychainFromDescriptor,
  isNativeSegwitDerivationPath,
  isTaprootDerivationPath,
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
  whenSupportedPaymentType,
} from '@leather.io/bitcoin';
import {
  createDescriptor,
  createKeyOriginPath,
  extractAccountIndexFromDescriptor,
  extractDerivationPathFromDescriptor,
  extractFingerprintFromDescriptor,
  fingerprintAsNumberToHex,
  makeAccountIdentifer,
} from '@leather.io/crypto';
import type { BitcoinNetworkModes } from '@leather.io/models';
import type { BitcoinKeychain } from '@leather.io/state/keychains';

import { useWalletType } from '@app/common/use-wallet-type';
import { selectStacksChain } from '@app/store/chains/stx-chain.selectors';
import { selectRootKeychains } from '@app/store/in-memory-key/in-memory-key.selectors';
import {
  selectAllBitcoinKeychains,
  selectBitcoinKeychainEntities,
} from '@app/store/ledger/bitcoin/bitcoin-key.slice';
import { selectCurrentNetwork, useCurrentNetwork } from '@app/store/networks/networks.selectors';

// For any given root keychain, return a derivation function accepting the
// minimum state required to derive the underlying account keychain, represented
// as a descriptor. From this, network, payment type and account index can be
// inferred: (fingerprint: string) => args => BitcoinKeychain
interface BitcoinAccountDerivationRequirements {
  paymentType: SupportedPaymentType;
  network: BitcoinNetworkModes;
  accountIndex: number;
}
function createSoftwareAccountKeychainGenerator(rootKeychain: HDKey) {
  return ({
    paymentType,
    network,
    accountIndex,
  }: BitcoinAccountDerivationRequirements): BitcoinKeychain => {
    const masterkeyFingerprint = fingerprintAsNumberToHex(rootKeychain.fingerprint);
    const derivationPathFn = whenSupportedPaymentType(paymentType)({
      p2tr: makeTaprootAccountDerivationPath,
      p2wpkh: makeNativeSegwitAccountDerivationPath,
    });
    const accountDerivationPath = derivationPathFn(network, accountIndex);
    const keychain = rootKeychain.derive(accountDerivationPath);
    const keyOrigin = createKeyOriginPath(masterkeyFingerprint, accountDerivationPath);
    const descriptor = createDescriptor(keyOrigin, keychain.publicExtendedKey);

    return { chain: 'bitcoin', descriptor };
  };
}

const selectSoftwareWalletBitcoinKeychainGenerator = createSelector(
  selectRootKeychains,
  rootKeychain =>
    mapValues(rootKeychain, keychain => createSoftwareAccountKeychainGenerator(keychain))
);

// This could be written as a single selector, but the intention is to be
// explicit about the transition of store-level keychain (descriptor only) to
// the more useful `BitcoinAccount` interface
const selectSoftwareWalletBitcoinAccountGenerator = createSelector(
  selectSoftwareWalletBitcoinKeychainGenerator,
  accountKeychainGenerator =>
    mapValues(
      accountKeychainGenerator,
      (generator: ReturnType<typeof createSoftwareAccountKeychainGenerator>) =>
        (args: BitcoinAccountDerivationRequirements) => {
          const keychainWithDescriptor = generator(args);
          return initializeBitcoinAccountKeychainFromDescriptor(keychainWithDescriptor.descriptor);
        }
    )
);

const selectLedgerBitcoinAccountLookup = createSelector(
  selectBitcoinKeychainEntities,
  ledgerKeychains => (fingerprint: string) => (args: BitcoinAccountDerivationRequirements) => {
    const derivationPathFn = whenSupportedPaymentType(args.paymentType)({
      p2tr: makeTaprootAccountDerivationPath,
      p2wpkh: makeNativeSegwitAccountDerivationPath,
    });

    const keyOrigin = createKeyOriginPath(
      fingerprint,
      derivationPathFn(args.network, args.accountIndex)
    );

    const keychain = ledgerKeychains[keyOrigin];
    if (!keychain) return undefined;
    return initializeBitcoinAccountKeychainFromDescriptor(keychain.policy);
  }
);

// This selector combines software wallet bitcoin account derivation, and look
// up to see if we have matching Ledger keys in the wallet, in a single lookup
// function
const selectBitcoinAccountLookup = createSelector(
  selectSoftwareWalletBitcoinAccountGenerator,
  selectLedgerBitcoinAccountLookup,
  (softwareGenerators, ledgerKeyLookup) =>
    (fingerprint: string) =>
    (args: BitcoinAccountDerivationRequirements) => {
      const softwareGenerator = softwareGenerators[fingerprint];
      if (softwareGenerator) return softwareGenerator(args);
      return ledgerKeyLookup(fingerprint)(args);
    }
);

export function useBitcoinAccountLookup() {
  return useSelector(selectBitcoinAccountLookup);
}

// Selector exists as a convenience to not have to pass in the current network
// each time, while not defaulting to only working with the existing network
type RequirementsWithoutNetwork = Omit<BitcoinAccountDerivationRequirements, 'network'>;
export const selectCurrentNetworkBitcoinAccountLookup = createSelector(
  selectBitcoinAccountLookup,
  selectCurrentNetwork,
  (accountLookup, network) => (fingerprint: string) => (args: RequirementsWithoutNetwork) =>
    accountLookup(fingerprint)({ ...args, network: network.chain.bitcoin.mode })
);

// TODO: very bad performance to use this selector to generate all keychains in
// a single place. Code should be written such that we only derive what we need
// when we need it. In the case of account lists, using virtual lists. Hope to
// deprecate this.
const selectBitcoinAccountKeychains = createSelector(
  selectRootKeychains,
  selectStacksChain,
  selectCurrentNetwork,
  selectAllBitcoinKeychains,
  (softwareKeychains, stacksChain, network, ledgerAccountDetails): BitcoinKeychain[] => {
    const accountKeychains: BitcoinKeychain[] = [];

    Object.entries(softwareKeychains).forEach(([fingerprint, keychain]) => {
      const childAccountGenerator = createSoftwareAccountKeychainGenerator(keychain);

      const highestAccountIndex = stacksChain[fingerprint]?.highestAccountIndex ?? 0;

      for (let accountIndex = 0; accountIndex <= highestAccountIndex; accountIndex++) {
        const accountArgs = { accountIndex, network: network.chain.bitcoin.mode };
        accountKeychains.push(childAccountGenerator({ paymentType: 'p2wpkh', ...accountArgs }));
        accountKeychains.push(childAccountGenerator({ paymentType: 'p2tr', ...accountArgs }));
      }
    });

    ledgerAccountDetails.forEach(details =>
      accountKeychains.push({ chain: 'bitcoin', descriptor: details.policy })
    );

    return accountKeychains;
  }
);

function createAccountKeychainMapSelector(pathFilterFn: (path: string) => boolean) {
  return createSelector(selectBitcoinAccountKeychains, keychains =>
    Object.fromEntries(
      keychains
        .filter(keychain => pathFilterFn(extractDerivationPathFromDescriptor(keychain.descriptor)))
        .map(keychain => [
          makeAccountIdentifer(
            extractFingerprintFromDescriptor(keychain.descriptor),
            extractAccountIndexFromDescriptor(keychain.descriptor)
          ),
          keychain,
        ])
    )
  );
}
const selectNativeSegwitAccountKeychainMap = createAccountKeychainMapSelector(
  isNativeSegwitDerivationPath
);
const selectTaprootAccountKeychainMap = createAccountKeychainMapSelector(isTaprootDerivationPath);

export function useNativeSegwitKeychainsMap() {
  return useSelector(selectNativeSegwitAccountKeychainMap);
}

export function useTaprootKeychainsMap() {
  return useSelector(selectTaprootAccountKeychainMap);
}

export function useBitcoinScureLibNetworkConfig() {
  const network = useCurrentNetwork();
  return getBtcSignerLibNetworkConfigByMode(network.chain.bitcoin.mode);
}

export function useBitcoinExtendedPublicKeyVersions(): Versions | undefined {
  const network = useCurrentNetwork();
  const { whenWallet } = useWalletType();
  // Only Ledger in testnet mode do we need to manually declare `Versions`
  return useMemo(() => {
    // whenWallet throws if it's neither. As whenWallet is also called on
    // SetPassword page, we need to catch because it's neither at that point
    try {
      return whenWallet({
        software: undefined,
        ledger: getHdKeyVersionsFromNetwork(
          bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode)
        ),
      });
    } catch {
      return undefined;
    }
  }, [network, whenWallet]);
}

interface BitcoinSoftwareSignerFns {
  sign(tx: btc.Transaction): void;
  signAtIndex(tx: btc.Transaction, index: number, allowedSighash?: number[]): void;
}
function createBitcoinSoftwareSigner(rootKeychain: HDKey) {
  return ({
    paymentType,
    network,
    accountIndex,
    changeIndex,
    addressIndex,
  }: BitcoinAccountDerivationRequirements & {
    changeIndex: number;
    addressIndex: number;
  }): BitcoinSoftwareSignerFns => {
    const derivationPathFn = whenSupportedPaymentType(paymentType)({
      p2tr: makeTaprootAccountDerivationPath,
      p2wpkh: makeNativeSegwitAccountDerivationPath,
    });
    const accountDerivationPath = derivationPathFn(network, accountIndex);
    const accountKeychain = rootKeychain.derive(accountDerivationPath);
    const addressIndexKeychain = deriveAddressIndexKeychainFromAccount(accountKeychain)({
      changeIndex,
      addressIndex,
    });

    return {
      sign(tx: btc.Transaction) {
        if (!addressIndexKeychain.privateKey)
          throw new Error('Unable to derive private key for signing');
        tx.sign(addressIndexKeychain.privateKey);
      },
      signAtIndex(tx: btc.Transaction, index: number, allowedSighash?: number[]) {
        if (!addressIndexKeychain.privateKey)
          throw new Error('Unable to derive private key for signing');
        tx.signIdx(addressIndexKeychain.privateKey, index, allowedSighash);
      },
    };
  };
}

const selectSoftwareWalletBitcoinSignerGenerator = createSelector(
  selectRootKeychains,
  rootKeychains => mapValues(rootKeychains, keychain => createBitcoinSoftwareSigner(keychain))
);

const selectBitcoinSoftwareSignerLookup = createSelector(
  selectSoftwareWalletBitcoinSignerGenerator,
  generators => (fingerprint: string) => generators[fingerprint]
);

export function useBitcoinSoftwareSignerLookup() {
  return useSelector(selectBitcoinSoftwareSignerLookup);
}
