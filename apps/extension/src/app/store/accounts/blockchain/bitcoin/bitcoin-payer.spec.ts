import { HDKey, type Versions } from '@scure/bip32';

import {
  getNativeSegwitPaymentFromAddressIndex,
  makeNativeSegwitAccountDerivationPath,
} from '@leather.io/bitcoin';
import { HD_KEY_VERSIONS_BY_NETWORK } from '@leather.io/constants';
import { createKeyOriginPath, fingerprintAsNumberToHex } from '@leather.io/crypto';
import type { BitcoinNetworkModes } from '@leather.io/models';

import { bitcoinSoftwarePayerFactory } from './bitcoin-payer';

function makeRootKeychain(seedByte: number, versions?: Versions) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte), versions);
}

function makeNativeSegwitPayerFactory({
  network,
  rootKeychain,
}: {
  network: BitcoinNetworkModes;
  rootKeychain: HDKey;
}) {
  const masterKeyFingerprint = fingerprintAsNumberToHex(rootKeychain.fingerprint);
  const accountKeyOrigin = createKeyOriginPath(
    masterKeyFingerprint,
    makeNativeSegwitAccountDerivationPath(network, 0)
  );
  const accountKeychain = rootKeychain.derive(makeNativeSegwitAccountDerivationPath(network, 0));

  return {
    accountKeychain,
    createPayer: bitcoinSoftwarePayerFactory({
      accountKeychain,
      accountKeyOrigin,
      masterKeyFingerprint,
      paymentFn: getNativeSegwitPaymentFromAddressIndex,
      network,
    }),
  };
}

describe(bitcoinSoftwarePayerFactory.name, () => {
  test('derives a software xpub payer on regtest without testnet extended key versions', () => {
    const { accountKeychain, createPayer } = makeNativeSegwitPayerFactory({
      network: 'regtest',
      rootKeychain: makeRootKeychain(1),
    });

    expect(accountKeychain.publicExtendedKey.startsWith('xpub')).toBe(true);

    const payer = createPayer({ changeIndex: 0, addressIndex: 0 });

    expect(payer.address.startsWith('bcrt1q')).toBe(true);
  });

  test('derives a Ledger-style tpub payer on regtest', () => {
    const { accountKeychain, createPayer } = makeNativeSegwitPayerFactory({
      network: 'regtest',
      rootKeychain: makeRootKeychain(2, HD_KEY_VERSIONS_BY_NETWORK.testnet),
    });

    expect(accountKeychain.publicExtendedKey.startsWith('tpub')).toBe(true);

    const payer = createPayer({ changeIndex: 0, addressIndex: 0 });

    expect(payer.address.startsWith('bcrt1q')).toBe(true);
  });
});
