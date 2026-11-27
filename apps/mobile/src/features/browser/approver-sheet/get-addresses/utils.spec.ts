import { hexToBytes } from '@stacks/common';
import { describe, expect, test } from 'vitest';

import { encodeExtendedPublicKeyForNetwork } from '@leather.io/bitcoin';
import { type BitcoinNetworkModes } from '@leather.io/models';

import { formatAddressesForGetAddresses } from './utils';

const testXpub =
  'xpub6CwY13JDrzeY55xGbiHxHwZSZpbkmrM7QMag3yVgZi62zaYFsBAUam1kghZZx4hDgDdkDzAMxc8xmpcyGAb1EoXoB7Vn7WTiUEaCEd3CcPq';
const testPublicKey = hexToBytes(
  '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
);

function formatForNetwork(bitcoinNetworkMode: BitcoinNetworkModes) {
  return formatAddressesForGetAddresses({
    fingerprint: '00000000',
    taproot: {
      address: 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr',
      publicKey: testPublicKey,
      derivationPath: "m/86'/0'/0'/0/0",
      xpub: testXpub,
    },
    nativeSegwit: {
      address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      publicKey: testPublicKey,
      derivationPath: "m/84'/0'/0'/0/0",
      xpub: testXpub,
    },
    stacksAccount: {
      address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      publicKey: testPublicKey,
    },
    bitcoinNetworkMode,
  });
}

function findDescriptor(addresses: ReturnType<typeof formatForNetwork>, type: string) {
  const entry = addresses.find(address => 'type' in address && address.type === type);
  return entry && 'descriptor' in entry ? entry.descriptor : undefined;
}

describe(formatAddressesForGetAddresses.name, () => {
  test('returns wpkh and tr descriptors with an xpub on mainnet', () => {
    const addresses = formatForNetwork('mainnet');
    const mainnetKey = encodeExtendedPublicKeyForNetwork(testXpub, 'mainnet');

    expect(mainnetKey.startsWith('xpub')).toBe(true);
    expect(findDescriptor(addresses, 'p2wpkh')).toEqual(`wpkh(${mainnetKey})`);
    expect(findDescriptor(addresses, 'p2tr')).toEqual(`tr(${mainnetKey})`);
  });

  test('returns wpkh and tr descriptors with a tpub on testnet', () => {
    const addresses = formatForNetwork('testnet');
    const testnetKey = encodeExtendedPublicKeyForNetwork(testXpub, 'testnet');

    expect(testnetKey.startsWith('tpub')).toBe(true);
    expect(findDescriptor(addresses, 'p2wpkh')).toEqual(`wpkh(${testnetKey})`);
    expect(findDescriptor(addresses, 'p2tr')).toEqual(`tr(${testnetKey})`);
  });
});
