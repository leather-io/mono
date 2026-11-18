import { hexToBytes } from '@noble/hashes/utils';

import type { OwnedUtxo } from '@leather.io/models';

import { matchInputsToWalletUtxos } from './match-wallet-utxos';

const nativeSegwitTxid = 'aabb1122334455667788990011223344aabb5566778899aabbccddeeff001122';
const taprootTxid = 'ccdd3344556677889900aabbccddeeff11223344556677889900aabbccddeeff';

const nativeSegwitUtxo: OwnedUtxo = {
  txid: nativeSegwitTxid,
  vout: 0,
  value: 200000,
  address: 'bc1q253fdeyzuwx58xxssd3a2xw2gq7khhpmr6vgnh',
  path: "m/84'/0'/0'/0/0",
  keyOrigin: "deadbeef/84'/0'/0'/0/0",
};

const taprootUtxo: OwnedUtxo = {
  txid: taprootTxid,
  vout: 1,
  value: 300000,
  address: 'bc1p0svqqvsaxtu5te5nxpq8qa9xg89rrenfg4xxvkhlqcu7hhrwzl9qgr0dya',
  path: "m/86'/0'/0'/0/0",
  keyOrigin: "deadbeef/86'/0'/0'/0/0",
};

const walletUtxos = [nativeSegwitUtxo, taprootUtxo];

describe(matchInputsToWalletUtxos.name, () => {
  test('returns the wallet utxos spent by the inputs, in input order', () => {
    const result = matchInputsToWalletUtxos(
      [
        { txid: hexToBytes(taprootTxid), index: 1 },
        { txid: hexToBytes(nativeSegwitTxid), index: 0 },
      ],
      walletUtxos
    );

    expect(result).toEqual([taprootUtxo, nativeSegwitUtxo]);
  });

  test('matches on both txid and vout', () => {
    const result = matchInputsToWalletUtxos(
      [{ txid: hexToBytes(taprootTxid), index: 0 }],
      walletUtxos
    );

    expect(result).toEqual([]);
  });

  test('skips inputs that are not wallet utxos', () => {
    const result = matchInputsToWalletUtxos(
      [
        { txid: hexToBytes('11'.repeat(32)), index: 0 },
        { txid: hexToBytes(nativeSegwitTxid), index: 0 },
      ],
      walletUtxos
    );

    expect(result).toEqual([nativeSegwitUtxo]);
  });

  test('skips inputs without a txid', () => {
    const result = matchInputsToWalletUtxos([{ index: 0 }], walletUtxos);

    expect(result).toEqual([]);
  });

  test('returns no matches for no inputs', () => {
    expect(matchInputsToWalletUtxos([], walletUtxos)).toEqual([]);
  });
});
