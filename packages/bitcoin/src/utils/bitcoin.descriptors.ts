import { HARDENED_OFFSET, HDKey } from '@scure/bip32';
import { makeTaprootAddressIndexDerivationPath } from 'payments/p2tr-address-gen';
import { makeNativeSegwitAddressIndexDerivationPath } from 'payments/p2wpkh-address-gen';

import { BitcoinNetworkModes } from '@leather.io/models';

import {
  SupportedPaymentType,
  getNativeSegwitAddress,
  getTaprootAddress,
  inferPaymentTypeFromPath,
  whenSupportedPaymentType,
} from './bitcoin.utils';

export function getDescriptorFromKeychain<T extends { keyOrigin: string; xpub: string }>(
  accountKeychain: T
) {
  switch (inferPaymentTypeFromPath(accountKeychain.keyOrigin)) {
    case 'p2tr':
      return `tr(${accountKeychain.xpub})`;
    case 'p2wpkh':
      return `wpkh(${accountKeychain.xpub})`;
    default:
      return undefined;
  }
}

export function inferPaymentTypeFromDescriptor(descriptor: string): SupportedPaymentType {
  const descriptorPrefix = descriptor.split('(')[0];
  switch (descriptorPrefix) {
    case 'tr':
      return 'p2tr';
    case 'wpkh':
      return 'p2wpkh';
    default:
      throw new Error('Unrecognized descriptor');
  }
}

export function extractXpubFromDescriptor(descriptor: string) {
  const match = descriptor.match(/\((xpub[0-9A-Za-z]+)\)/);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error('Invalid descriptor format');
}

export interface DeriveAddressesFromDescriptorArgs {
  accountDescriptor: string;
  network: BitcoinNetworkModes;
  limit?: number; // number of addresses to derive
}

export interface DeriveAddressesFromDescriptorResult {
  address: string;
  path: string;
}

export function deriveAddressesFromDescriptor({
  accountDescriptor,
  network,
  limit = 1,
}: DeriveAddressesFromDescriptorArgs): DeriveAddressesFromDescriptorResult[] {
  const accountKeychain = HDKey.fromExtendedKey(extractXpubFromDescriptor(accountDescriptor));
  const paymentType = inferPaymentTypeFromDescriptor(accountDescriptor);

  const derivationPathFn = whenSupportedPaymentType(paymentType)({
    p2tr: makeTaprootAddressIndexDerivationPath,
    p2wpkh: makeNativeSegwitAddressIndexDerivationPath,
  });

  const results: DeriveAddressesFromDescriptorResult[] = [];

  for (let i = 0; i < limit; i++) {
    const address = whenSupportedPaymentType(paymentType)({
      p2tr: getTaprootAddress({ index: i, keychain: accountKeychain, network }),
      p2wpkh: getNativeSegwitAddress({ index: i, keychain: accountKeychain, network }),
    });
    results.push({
      address,
      path: derivationPathFn(network, accountKeychain.index - HARDENED_OFFSET, i),
    });
  }
  return results;
}
