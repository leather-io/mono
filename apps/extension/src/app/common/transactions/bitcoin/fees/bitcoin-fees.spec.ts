import { sha256 } from 'bitcoinjs-lib/src/crypto';

import { filterUneconomicalUtxos } from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { calculateMaxBitcoinSpend } from './calculate-max-bitcoin-spend';

function generateTxId(value: number): OwnedUtxo {
  const buffer = Buffer.from(Math.random().toString());
  return {
    txid: sha256(sha256(buffer)).toString(),
    vout: 0,
    value,
    address: 'bc1qtest',
    path: "m/84'/0'/0'/0/0",
    keyOrigin: 'test',
  };
}

function generateTransactions(values: number[]) {
  return values.map(val => generateTxId(val));
}

describe(calculateMaxBitcoinSpend.name, () => {
  const utxos = generateTransactions([600, 600, 1200, 1200, 10000, 10000, 25000, 40000, 50000000]);

  test('with 1 sat/vb fee', () => {
    const fee = 1;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos,
      feeRate: fee,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50087979);
  });

  test('with 5 sat/vb fee', () => {
    const fee = 5;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos,
      feeRate: fee,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50085497);
  });

  test('with 30 sat/vb fee', () => {
    const fee = 30;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos,
      feeRate: fee,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50074515);
  });

  test('with 100 sat/vb fee', () => {
    const fee = 100;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos,
      feeRate: fee,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(50050050);
  });

  test('with 400 sat/vb fee', () => {
    const fee = 400;
    const maxBitcoinSpend = calculateMaxBitcoinSpend({
      address: '',
      utxos,
      feeRate: fee,
    });
    expect(maxBitcoinSpend.amount.amount.toNumber()).toEqual(49981500);
  });
});

describe(filterUneconomicalUtxos.name, () => {
  const utxos = generateTransactions([600, 600, 1200, 1200, 10000, 10000, 25000, 40000, 50000000]);
  const recipients = [
    {
      address: '',
      amount: createMoney(0, 'BTC'),
    },
  ];

  test('with 1 sat/vb fee', () => {
    const fee = 1;
    const filteredUtxos = filterUneconomicalUtxos({
      utxos,
      feeRate: fee,
      recipients,
    });

    expect(filteredUtxos.length).toEqual(9);
  });

  test('with 10 sat/vb fee', () => {
    const fee = 10;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(7);
  });

  test('with 30 sat/vb fee', () => {
    const fee = 30;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(5);
  });

  test('with 200 sat/vb fee', () => {
    const fee = 200;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(3);
  });

  test('with 400 sat/vb fee', () => {
    const fee = 400;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(2);
  });
});
