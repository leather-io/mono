import { createMoney } from '@leather.io/utils';

import { recipientAddress } from '../mocks/mocks';
import {
  generateMockTaprootTransactions,
  generateMockTransactions,
  mockTaprootUtxos,
  mockUtxos,
} from './coin-selection.mocks';
import {
  countInputsByScriptType,
  filterUneconomicalUtxos,
  getSizeInfo,
  getSpendableAmount,
} from './coin-selection.utils';

describe(filterUneconomicalUtxos.name, () => {
  const recipients = [
    {
      address: recipientAddress,
      amount: createMoney(0, 'BTC'),
    },
  ];

  test('with 1 sat/vb fee', () => {
    const fee = 1;
    const filteredUtxos = filterUneconomicalUtxos({
      utxos: mockUtxos,
      feeRate: fee,
      recipients,
    });

    expect(filteredUtxos.length).toEqual(9);
  });

  test('with 10 sat/vb fee', () => {
    const fee = 10;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos: mockUtxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(7);
  });

  test('with 30 sat/vb fee', () => {
    const fee = 30;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos: mockUtxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(5);
  });

  test('with 200 sat/vb fee', () => {
    const fee = 200;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos: mockUtxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(3);
  });

  test('with 400 sat/vb fee', () => {
    const fee = 400;
    const filteredUtxos = filterUneconomicalUtxos({
      recipients,
      utxos: mockUtxos,
      feeRate: fee,
    });
    expect(filteredUtxos.length).toEqual(2);
  });

  describe('with taproot utxos', () => {
    test('that every surviving taproot utxo increases spendable amount', () => {
      const feeRate = 200;
      const survivors = filterUneconomicalUtxos({
        utxos: mockTaprootUtxos,
        feeRate,
        recipients,
      });

      const { spendableAmount: fullAmount } = getSpendableAmount({
        utxos: mockTaprootUtxos,
        feeRate,
        recipients,
      });

      for (const utxo of survivors) {
        const { spendableAmount: withoutUtxo } = getSpendableAmount({
          utxos: mockTaprootUtxos.filter(u => u.txid !== utxo.txid),
          feeRate,
          recipients,
        });
        expect(fullAmount.toNumber()).toBeGreaterThan(withoutUtxo.toNumber());
      }
    });

    test('that every filtered taproot utxo does not increase spendable amount', () => {
      const feeRate = 200;
      const survivors = filterUneconomicalUtxos({
        utxos: mockTaprootUtxos,
        feeRate,
        recipients,
      });
      const filtered = mockTaprootUtxos.filter(u => !survivors.some(s => s.txid === u.txid));

      expect(filtered.length).toBeGreaterThan(0);

      const { spendableAmount: fullAmount } = getSpendableAmount({
        utxos: mockTaprootUtxos,
        feeRate,
        recipients,
      });

      for (const utxo of filtered) {
        const { spendableAmount: withoutUtxo } = getSpendableAmount({
          utxos: mockTaprootUtxos.filter(u => u.txid !== utxo.txid),
          feeRate,
          recipients,
        });
        expect(withoutUtxo.toNumber()).toBeGreaterThanOrEqual(fullAmount.toNumber());
      }
    });

    test('that taproot inputs are cheaper so more survive than native segwit', () => {
      const feeRate = 10;
      const segwitResult = filterUneconomicalUtxos({
        utxos: mockUtxos,
        feeRate,
        recipients,
      });
      const taprootResult = filterUneconomicalUtxos({
        utxos: mockTaprootUtxos,
        feeRate,
        recipients,
      });

      expect(taprootResult.length).toBeGreaterThan(segwitResult.length);
    });

    test('that taproot utxo below dust threshold is filtered even at low fee rate', () => {
      const utxosWithDust = generateMockTaprootTransactions([200, 50000000]);
      const result = filterUneconomicalUtxos({
        utxos: utxosWithDust,
        feeRate: 1,
        recipients,
      });

      expect(result.length).toEqual(1);
      expect(result[0].value).toEqual(50000000);
    });
  });
});

describe(getSizeInfo.name, () => {
  const recipients = [{ address: recipientAddress, amount: createMoney(0, 'BTC') }];
  const utxos = generateMockTransactions([100000, 100000]);

  test('sizes p2wsh multisig inputs heavier than the default single-sig path', () => {
    const singleSig = getSizeInfo({ utxos, recipients });
    const multisig = getSizeInfo({
      utxos,
      recipients,
      inputSizing: { paymentType: 'p2wsh', threshold: 2, signerCount: 3 },
    });

    expect(multisig.txVBytes).toBeGreaterThan(singleSig.txVBytes);
  });

  test('grows with the m-of-n, confirming threshold and signer count reach the estimator', () => {
    const twoOfThree = getSizeInfo({
      utxos,
      recipients,
      inputSizing: { paymentType: 'p2wsh', threshold: 2, signerCount: 3 },
    });
    const threeOfFive = getSizeInfo({
      utxos,
      recipients,
      inputSizing: { paymentType: 'p2wsh', threshold: 3, signerCount: 5 },
    });

    expect(threeOfFive.txVBytes).toBeGreaterThan(twoOfThree.txVBytes);
  });

  test('leaves the default single-sig sizing unchanged when no inputSizing is given', () => {
    const omitted = getSizeInfo({ utxos, recipients });
    const explicitUndefined = getSizeInfo({ utxos, recipients, inputSizing: undefined });

    expect(omitted.txVBytes).toEqual(explicitUndefined.txVBytes);
  });
});

describe(countInputsByScriptType.name, () => {
  test('all native segwit utxos', () => {
    const result = countInputsByScriptType(mockUtxos);
    expect(result).toEqual({ p2wpkh: 9, p2tr: 0 });
  });

  test('all taproot utxos', () => {
    const result = countInputsByScriptType(mockTaprootUtxos);
    expect(result).toEqual({ p2wpkh: 0, p2tr: 9 });
  });

  test('mixed utxos', () => {
    const mixed = [
      ...generateMockTransactions([1000, 2000]),
      ...generateMockTaprootTransactions([3000, 4000, 5000]),
    ];
    const result = countInputsByScriptType(mixed);
    expect(result).toEqual({ p2wpkh: 2, p2tr: 3 });
  });
});
