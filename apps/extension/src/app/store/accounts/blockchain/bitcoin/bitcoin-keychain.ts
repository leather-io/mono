import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { mapValues } from 'remeda';

import {
  type SupportedPaymentType,
  deriveAddressIndexKeychainFromAccount,
  getBtcSignerLibNetworkConfigByMode,
  initializeBitcoinAccountKeychainFromDescriptor,
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
  whenSupportedPaymentType,
} from '@leather.io/bitcoin';
import {
  createDescriptor,
  createKeyOriginPath,
  extractKeyOriginPathFromDescriptor,
  fingerprintAsNumberToHex,
} from '@leather.io/crypto';
import type { BitcoinNetworkModes } from '@leather.io/models';
import type { BitcoinKeychain } from '@leather.io/state/keychains';

import type { RootState } from '@app/store';
import { selectRootKeychainsAtVersion } from '@app/store/in-memory-key/in-memory-key.selectors';
import {
  createKeychainSelector,
  registerKeychainSelectorCache,
} from '@app/store/in-memory-key/keychain-selector-cache';
import { useInMemoryKeys } from '@app/store/in-memory-key/use-in-memory-keys';
import { selectBitcoinKeychains } from '@app/store/keychains/keychain.selectors';
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

const selectSoftwareWalletBitcoinKeychainGenerator = registerKeychainSelectorCache(
  createKeychainSelector(selectRootKeychainsAtVersion, rootKeychain =>
    mapValues(rootKeychain, keychain => createSoftwareAccountKeychainGenerator(keychain))
  )
);

// This could be written as a single selector, but the intention is to be
// explicit about the transition of store-level keychain (descriptor only) to
// the more useful `BitcoinAccount` interface
const selectSoftwareWalletBitcoinAccountGenerator = registerKeychainSelectorCache(
  createKeychainSelector(selectSoftwareWalletBitcoinKeychainGenerator, accountKeychainGenerator =>
    mapValues(
      accountKeychainGenerator,
      (generator: ReturnType<typeof createSoftwareAccountKeychainGenerator>) =>
        (args: BitcoinAccountDerivationRequirements) => {
          const keychainWithDescriptor = generator(args);
          return initializeBitcoinAccountKeychainFromDescriptor(keychainWithDescriptor.descriptor);
        }
    )
  )
);

const selectLedgerBitcoinAccountLookup = createSelector(
  selectBitcoinKeychains,
  bitcoinKeychains => (fingerprint: string) => (args: BitcoinAccountDerivationRequirements) => {
    const derivationPathFn = whenSupportedPaymentType(args.paymentType)({
      p2tr: makeTaprootAccountDerivationPath,
      p2wpkh: makeNativeSegwitAccountDerivationPath,
    });

    const keyOrigin = createKeyOriginPath(
      fingerprint,
      derivationPathFn(args.network, args.accountIndex)
    );

    const keychain = bitcoinKeychains.find(kc => {
      const kcKeyOrigin = extractKeyOriginPathFromDescriptor(kc.descriptor);
      return kcKeyOrigin === keyOrigin;
    });
    if (!keychain) return undefined;
    return initializeBitcoinAccountKeychainFromDescriptor(keychain.descriptor);
  }
);

// This selector combines software wallet bitcoin account derivation, and look
// up to see if we have matching Ledger keys in the wallet, in a single lookup
// function
const selectBitcoinAccountLookup = registerKeychainSelectorCache(
  createKeychainSelector(
    selectSoftwareWalletBitcoinAccountGenerator,
    selectLedgerBitcoinAccountLookup,
    (softwareGenerators, ledgerKeyLookup) =>
      (fingerprint: string) =>
      (args: BitcoinAccountDerivationRequirements) => {
        const softwareGenerator = softwareGenerators[fingerprint];
        if (softwareGenerator) return softwareGenerator(args);
        return ledgerKeyLookup(fingerprint)(args);
      }
  )
);

export function useBitcoinAccountLookup() {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectBitcoinAccountLookup(state, version));
}

// Selector exists as a convenience to not have to pass in the current network
// each time, while not defaulting to only working with the existing network
type RequirementsWithoutNetwork = Omit<BitcoinAccountDerivationRequirements, 'network'>;
export const selectCurrentNetworkBitcoinAccountLookup = registerKeychainSelectorCache(
  createKeychainSelector(
    selectBitcoinAccountLookup,
    selectCurrentNetwork,
    (accountLookup, network) => (fingerprint: string) => (args: RequirementsWithoutNetwork) =>
      accountLookup(fingerprint)({ ...args, network: network.chain.bitcoin.mode })
  )
);

export function useBitcoinScureLibNetworkConfig() {
  const network = useCurrentNetwork();
  return getBtcSignerLibNetworkConfigByMode(network.chain.bitcoin.mode);
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

const selectSoftwareWalletBitcoinSignerGenerator = registerKeychainSelectorCache(
  createKeychainSelector(selectRootKeychainsAtVersion, rootKeychains =>
    mapValues(rootKeychains, keychain => createBitcoinSoftwareSigner(keychain))
  )
);

const selectBitcoinSoftwareSignerLookup = registerKeychainSelectorCache(
  createKeychainSelector(
    selectSoftwareWalletBitcoinSignerGenerator,
    generators => (fingerprint: string) => generators[fingerprint]
  )
);

export function useBitcoinSoftwareSignerLookup() {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectBitcoinSoftwareSignerLookup(state, version));
}
