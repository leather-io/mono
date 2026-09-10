import { BTC_P2WPKH_DUST_AMOUNT } from '@leather.io/constants';
import { createMoney } from '@leather.io/utils';

import { invalidAddress, recipientAddress } from '../mocks/mocks';
import { determineUtxosForSpend } from './coin-selection';
import {
  calculateMaxSpendWithinInputLimit,
  countUtxosForSpend,
} from './coin-selection-input-limit';
import { getSizeInfo } from './coin-selection.utils';

function makeUtxos(values: number[]) {
  return values.map((value, index) => ({ txid: `tx${index}`, value, address: recipientAddress }));
}

function makeRecipients(amount: number) {
  return [{ address: recipientAddress, amount: createMoney(amount, 'BTC') }];
}

const feeRate = 10;
const maxInputs = 100;

describe(calculateMaxSpendWithinInputLimit.name, () => {
  test('that an empty utxo set spends nothing', () => {
    const result = calculateMaxSpendWithinInputLimit({
      recipient: recipientAddress,
      utxos: [],
      feeRate,
      maxInputs,
    });
    expect(result.amount.amount.toNumber()).toEqual(0);
    expect(result.inputCount).toEqual(0);
    expect(result.economicalInputCount).toEqual(0);
  });

  test('that a zero fee rate spends nothing', () => {
    const result = calculateMaxSpendWithinInputLimit({
      recipient: recipientAddress,
      utxos: makeUtxos([10_000, 10_000]),
      feeRate: 0,
      maxInputs,
    });
    expect(result.amount.amount.toNumber()).toEqual(0);
  });

  test('that only the largest maxInputs utxos are spent, sized with a change output', () => {
    const utxos = makeUtxos(Array.from({ length: 150 }, () => 10_000));
    const result = calculateMaxSpendWithinInputLimit({
      recipient: recipientAddress,
      utxos,
      feeRate,
      maxInputs,
    });

    const expectedSize = getSizeInfo({
      utxos: utxos.slice(0, maxInputs),
      recipients: makeRecipients(0),
    });
    const expectedFee = Math.ceil(expectedSize.txVBytes * feeRate);

    expect(result.inputCount).toEqual(maxInputs);
    expect(result.economicalInputCount).toEqual(150);
    expect(result.fee).toEqual(expectedFee);
    expect(result.amount.amount.toNumber()).toEqual(maxInputs * 10_000 - expectedFee);
  });

  test('that sending exactly the returned amount selects no more than maxInputs inputs', () => {
    const utxos = makeUtxos(Array.from({ length: 150 }, () => 10_000));
    const { amount } = calculateMaxSpendWithinInputLimit({
      recipient: recipientAddress,
      utxos,
      feeRate,
      maxInputs,
    });

    const withinLimit = determineUtxosForSpend({
      utxos: [...utxos],
      feeRate,
      recipients: makeRecipients(amount.amount.toNumber()),
    });
    expect(withinLimit.inputs.length).toEqual(maxInputs);

    const overLimit = determineUtxosForSpend({
      utxos: [...utxos],
      feeRate,
      recipients: makeRecipients(amount.amount.toNumber() + 1),
    });
    expect(overLimit.inputs.length).toEqual(maxInputs + 1);
  });

  test('that the largest utxos are picked first', () => {
    const utxos = makeUtxos([1_000, 50_000, 3_000, 20_000]);
    const result = calculateMaxSpendWithinInputLimit({
      recipient: recipientAddress,
      utxos,
      feeRate,
      maxInputs: 2,
    });
    expect(result.inputCount).toEqual(2);
    expect(result.amount.amount.toNumber()).toEqual(70_000 - result.fee);
  });

  test('that dust and uneconomical utxos are not counted', () => {
    const utxos = makeUtxos([50_000, BTC_P2WPKH_DUST_AMOUNT - 1, 600]);
    const result = calculateMaxSpendWithinInputLimit({
      recipient: recipientAddress,
      utxos,
      feeRate: 50,
      maxInputs,
    });
    expect(result.economicalInputCount).toEqual(1);
    expect(result.inputCount).toEqual(1);
  });

  test('that the caller utxo array is not reordered', () => {
    const utxos = makeUtxos([1_000, 50_000, 3_000]);
    calculateMaxSpendWithinInputLimit({ recipient: recipientAddress, utxos, feeRate, maxInputs });
    expect(utxos.map(utxo => utxo.value)).toEqual([1_000, 50_000, 3_000]);
  });
});

describe(countUtxosForSpend.name, () => {
  test('that it returns the number of inputs coin selection picks', () => {
    const count = countUtxosForSpend({
      utxos: makeUtxos([10_000, 10_000, 10_000, 10_000, 10_000]),
      feeRate,
      recipients: makeRecipients(25_000),
    });
    expect(count).toEqual(3);
  });

  test('that send max counts every economical utxo', () => {
    const count = countUtxosForSpend({
      utxos: makeUtxos([10_000, 10_000, 10_000, 10_000, 10_000]),
      feeRate,
      recipients: makeRecipients(49_000),
      isSendMax: true,
    });
    expect(count).toEqual(5);
  });

  test('that insufficient funds yields null', () => {
    const count = countUtxosForSpend({
      utxos: makeUtxos([10_000]),
      feeRate,
      recipients: makeRecipients(25_000),
    });
    expect(count).toBeNull();
  });

  test('that an invalid recipient yields null', () => {
    const count = countUtxosForSpend({
      utxos: makeUtxos([10_000]),
      feeRate,
      recipients: [{ address: invalidAddress, amount: createMoney(1_000, 'BTC') }],
    });
    expect(count).toBeNull();
  });

  test('that the caller utxo array is not reordered', () => {
    const utxos = makeUtxos([1_000, 50_000, 3_000]);
    countUtxosForSpend({ utxos, feeRate, recipients: makeRecipients(2_000) });
    expect(utxos.map(utxo => utxo.value)).toEqual([1_000, 50_000, 3_000]);
  });
});
