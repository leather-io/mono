import { BTC_P2WPKH_DUST_AMOUNT } from '@leather.io/constants';
import { createMoney, createNullArrayOfLength, sumNumbers } from '@leather.io/utils';

import {
  invalidAddress,
  legacyAddress,
  recipientAddress,
  segwitAddress,
  taprootAddress,
} from '../mocks/mocks';
import { isBitcoinAddress } from '../validation/bitcoin-address';
import { determineUtxosForSpend, determineUtxosForSpendAll } from './coin-selection';
import { generateMockTaprootTransactions, generateMockTransactions } from './coin-selection.mocks';
import { filterUneconomicalUtxos, getSizeInfo } from './coin-selection.utils';

const demoUtxos = [
  { txid: 'a1', value: 8200, address: recipientAddress },
  { txid: 'a2', value: 8490, address: recipientAddress },
  { txid: 'a3', value: 8790, address: recipientAddress },
  { txid: 'a4', value: 19, address: recipientAddress },
  { txid: 'a5', value: 2000, address: recipientAddress },
  { txid: 'a6', value: 2340, address: recipientAddress },
  { txid: 'a7', value: 1230, address: recipientAddress },
  { txid: 'a8', value: 120, address: recipientAddress },
  { txid: 'a9', value: 8, address: recipientAddress },
  { txid: 'a10', value: 1002, address: recipientAddress },
  { txid: 'a11', value: 1382, address: recipientAddress },
  { txid: 'a12', value: 1400, address: recipientAddress },
  { txid: 'a13', value: 909, address: recipientAddress },
];

function generate10kSpendWithDummyUtxoSet(recipient: string) {
  if (!isBitcoinAddress(recipient)) {
    throw new Error('Invalid Bitcoin address');
  }
  return determineUtxosForSpend({
    utxos: demoUtxos,
    feeRate: 20,
    recipients: [{ address: recipient, amount: createMoney(10_000, 'BTC') }],
  });
}

describe(determineUtxosForSpend.name, () => {
  describe('Estimated size', () => {
    test('that Native Segwit, 1 input 2 outputs weighs 140 vBytes', () => {
      const estimation = determineUtxosForSpend({
        utxos: [{ txid: 'b1', value: 50_000, address: recipientAddress }],
        recipients: [
          {
            address: recipientAddress,
            amount: createMoney(40_000, 'BTC'),
          },
        ],
        feeRate: 20,
      });
      expect(estimation.txVBytes).toBeGreaterThan(140);
      expect(estimation.txVBytes).toBeLessThan(142);
    });

    test('that Native Segwit, 2 input 2 outputs weighs 200vBytes', () => {
      const estimation = determineUtxosForSpend({
        utxos: [
          { txid: 'c1', value: 50_000, address: recipientAddress },
          { txid: 'c2', value: 50_000, address: recipientAddress },
        ],
        recipients: [
          {
            address: recipientAddress,
            amount: createMoney(60_000, 'BTC'),
          },
        ],
        feeRate: 20,
      });
      expect(estimation.txVBytes).toBeGreaterThan(208);
      expect(estimation.txVBytes).toBeLessThan(209);
    });

    test('that Native Segwit, 10 input 2 outputs weighs 200vBytes', () => {
      const estimation = determineUtxosForSpend({
        utxos: [
          { txid: 'd1', value: 20_000, address: recipientAddress },
          { txid: 'd2', value: 20_000, address: recipientAddress },
          { txid: 'd3', value: 10_000, address: recipientAddress },
          { txid: 'd4', value: 10_000, address: recipientAddress },
          { txid: 'd5', value: 10_000, address: recipientAddress },
          { txid: 'd6', value: 10_000, address: recipientAddress },
          { txid: 'd7', value: 10_000, address: recipientAddress },
          { txid: 'd8', value: 10_000, address: recipientAddress },
          { txid: 'd9', value: 10_000, address: recipientAddress },
          { txid: 'd10', value: 10_000, address: recipientAddress },
        ],
        recipients: [
          {
            address: recipientAddress,
            amount: createMoney(100_000, 'BTC'),
          },
        ],
        feeRate: 20,
      });
      expect(estimation.txVBytes).toBeGreaterThan(750);
      expect(estimation.txVBytes).toBeLessThan(751);
    });
  });

  describe('sorting algorithm', () => {
    test('that it filters out dust utxos', () => {
      const result = generate10kSpendWithDummyUtxoSet(recipientAddress);
      const hasDust = result.filteredUtxos.some(utxo => utxo.value <= BTC_P2WPKH_DUST_AMOUNT);
      expect(hasDust).toBeFalsy();
    });

    test('that it sorts utxos in decending order', () => {
      const result = generate10kSpendWithDummyUtxoSet(recipientAddress);
      result.inputs.forEach((u, i) => {
        const nextUtxo = result.inputs[i + 1];
        if (!nextUtxo) return;
        expect(u.value >= nextUtxo.value).toEqual(true);
      });
    });
  });

  test('that it accepts a wrapped segwit address', () =>
    expect(() => generate10kSpendWithDummyUtxoSet(segwitAddress)).not.toThrowError());

  test('that it accepts a legacy addresses', () =>
    expect(() => generate10kSpendWithDummyUtxoSet(legacyAddress)).not.toThrowError());

  test('that it throws an error with non-legit address', () => {
    expect(() => generate10kSpendWithDummyUtxoSet(invalidAddress)).toThrowError();
  });

  test('that given a set of utxos, legacy is more expensive', () => {
    const legacy = generate10kSpendWithDummyUtxoSet(legacyAddress);
    const segwit = generate10kSpendWithDummyUtxoSet(segwitAddress);
    expect(legacy.fee.amount.isGreaterThan(segwit.fee.amount)).toBeTruthy();
  });

  test('that given a set of utxos, wrapped segwit is more expensive than native', () => {
    const segwit = generate10kSpendWithDummyUtxoSet(segwitAddress);
    const native = generate10kSpendWithDummyUtxoSet(recipientAddress);
    expect(segwit.fee.amount.isGreaterThan(native.fee.amount)).toBeTruthy();
  });

  test('that given a set of utxos, taproot is more expensive than native segwit', () => {
    // Non-obvious behaviour.
    // P2TR outputs = 34 vBytes
    // P2WPKH outputs = 22 vBytes
    const native = generate10kSpendWithDummyUtxoSet(recipientAddress);
    const taproot = generate10kSpendWithDummyUtxoSet(taprootAddress);
    expect(taproot.fee.amount.isGreaterThan(native.fee.amount)).toBeTruthy();
  });

  test('against a random set of generated utxos', () => {
    const testData = createNullArrayOfLength(50).map((_, i) => ({
      txid: `rnd${i}`,
      value: Math.ceil(Math.random() * 10000),
      address: recipientAddress,
    }));
    const amount = 29123n;
    const result = determineUtxosForSpend({
      utxos: testData,
      recipients: [
        {
          address: recipientAddress,
          amount: createMoney(Number(amount), 'BTC'),
        },
      ],
      feeRate: 3,
    });
    expect(result.outputs[0].value).toEqual(29123n);

    expect(result.outputs[1].value.toString()).toEqual(
      sumNumbers(result.inputs.map(i => i.value))
        .minus(result.fee.amount)
        .minus(amount.toString())
        .toString()
    );
  });

  test('that spending all economical spendable utxos does not result in dust utxos', () => {
    const feeRate = 3;
    const recipients = [
      {
        address: recipientAddress,
        amount: createMoney(1, 'BTC'),
      },
    ];
    const filteredUtxos = filterUneconomicalUtxos({
      utxos: demoUtxos.sort((a, b) => b.value - a.value),
      feeRate,
      recipients,
    });
    const amount = filteredUtxos.reduce((total, utxo) => total + utxo.value, 0) - 2251;
    recipients[0].amount = createMoney(amount, 'BTC');

    const result = determineUtxosForSpend({
      utxos: filteredUtxos,
      recipients: [
        {
          address: recipientAddress,
          amount: createMoney(amount, 'BTC'),
        },
      ],
      feeRate,
    });
    expect(result.inputs.length).toEqual(10);
    expect(result.outputs.length).toEqual(1);
    expect(result.fee.amount.isEqualTo(2251)).toBeTruthy();
  });

  test('that spending all utxos with sendMax does not result in dust utxos', () => {
    const utxos = [
      { txid: '123', value: 1000, address: recipientAddress },
      { txid: '1323', value: 2000, address: recipientAddress },
      { txid: '132355', value: 3000, address: recipientAddress },
    ];
    const recipients = [
      {
        address: recipientAddress,
        amount: createMoney(Number(1), 'BTC'),
      },
    ];
    const sizeInfo = getSizeInfo({
      utxos,
      isSendMax: true,
      recipients,
    });
    const feeRate = 3;
    const fee = Math.floor(sizeInfo.txVBytes * feeRate);
    const amount = utxos.reduce((total, utxo) => total + utxo.value, 0) - fee;
    recipients[0].amount = createMoney(amount, 'BTC');

    const result = determineUtxosForSpendAll({
      utxos: utxos,
      recipients,
      feeRate,
    });
    expect(result.inputs.length).toEqual(utxos.length);
    expect(result.outputs.length).toEqual(1);
    expect(result.fee.amount.isEqualTo(735)).toBeTruthy();
    expect(fee).toEqual(735);
  });
});

describe('mixed input types', () => {
  test('that spending from P2TR-only inputs produces correct fee estimation', () => {
    const taprootUtxos = generateMockTaprootTransactions([50_000]);
    const estimation = determineUtxosForSpend({
      utxos: taprootUtxos,
      recipients: [
        {
          address: recipientAddress,
          amount: createMoney(40_000, 'BTC'),
        },
      ],
      feeRate: 20,
    });
    expect(estimation.fee.amount.toNumber()).toBeGreaterThan(0);
    expect(estimation.inputs).toHaveLength(1);
    expect(estimation.txVBytes).toBeGreaterThanOrEqual(130);
    expect(estimation.txVBytes).toBeLessThan(155);
  });

  test('that spending from mixed P2WPKH + P2TR inputs uses correct vBytes', () => {
    const nativeSegwitUtxos = generateMockTransactions([30_000]);
    const taprootUtxos = generateMockTaprootTransactions([30_000]);
    const mixedUtxos = [...nativeSegwitUtxos, ...taprootUtxos];

    const estimation = determineUtxosForSpend({
      utxos: mixedUtxos,
      recipients: [
        {
          address: recipientAddress,
          amount: createMoney(50_000, 'BTC'),
        },
      ],
      feeRate: 20,
    });
    expect(estimation.inputs).toHaveLength(2);
    expect(estimation.fee.amount.toNumber()).toBeGreaterThan(0);
    expect(estimation.txVBytes).toBeGreaterThan(170);
    expect(estimation.txVBytes).toBeLessThan(210);
  });
});
