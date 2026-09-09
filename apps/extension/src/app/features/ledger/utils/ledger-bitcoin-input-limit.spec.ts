import { recipientAddress } from '@leather.io/bitcoin';
import { LEDGER_BITCOIN_MAX_INPUTS } from '@leather.io/constants';
import type { OwnedUtxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  assertLedgerBitcoinInputLimit,
  emptyLedgerBitcoinInputLimit,
  getLedgerBitcoinInputLimit,
} from './ledger-bitcoin-input-limit';

function makeUtxos(count: number, value: number): OwnedUtxo[] {
  return Array.from({ length: count }, (_, index) => ({
    txid: `tx${index}`,
    vout: 0,
    value,
    address: recipientAddress,
    path: "m/84'/0'/0'/0/0",
    keyOrigin: 'test',
  }));
}

function makeRecipients(amount: number) {
  return [{ address: recipientAddress, amount: createMoney(amount, 'BTC') }];
}

const feeRate = 10;

describe(getLedgerBitcoinInputLimit.name, () => {
  test('that it is empty without a fee rate', () => {
    const result = getLedgerBitcoinInputLimit({
      utxos: makeUtxos(150, 10_000),
      recipients: makeRecipients(1_000_000),
    });
    expect(result).toEqual(emptyLedgerBitcoinInputLimit);
  });

  test('that it is empty without utxos', () => {
    const result = getLedgerBitcoinInputLimit({
      utxos: [],
      recipients: makeRecipients(1_000_000),
      feeRate,
    });
    expect(result).toEqual(emptyLedgerBitcoinInputLimit);
  });

  test('that it is empty while no amount has been entered', () => {
    const result = getLedgerBitcoinInputLimit({
      utxos: makeUtxos(150, 10_000),
      recipients: makeRecipients(0),
      feeRate,
    });
    expect(result).toEqual(emptyLedgerBitcoinInputLimit);
  });

  test('that a spend needing more than the limit exceeds it and reports the max amount', () => {
    const result = getLedgerBitcoinInputLimit({
      utxos: makeUtxos(150, 10_000),
      recipients: makeRecipients(1_100_000),
      feeRate,
    });
    expect(result.exceedsLimit).toBe(true);
    expect(result.inputCount).toBeGreaterThan(LEDGER_BITCOIN_MAX_INPUTS);
    expect(result.maxAmountWithinLimit?.amount.toNumber()).toBeGreaterThan(0);
    expect(result.maxAmountWithinLimit?.amount.toNumber()).toBeLessThan(
      LEDGER_BITCOIN_MAX_INPUTS * 10_000
    );
  });

  test('that send max counts every economical utxo', () => {
    const result = getLedgerBitcoinInputLimit({
      utxos: makeUtxos(150, 10_000),
      recipients: makeRecipients(1_490_000),
      feeRate,
      isSendingMax: true,
    });
    expect(result.inputCount).toEqual(150);
    expect(result.exceedsLimit).toBe(true);
  });

  test('that a spend within the limit does not exceed it', () => {
    const result = getLedgerBitcoinInputLimit({
      utxos: makeUtxos(50, 10_000),
      recipients: makeRecipients(100_000),
      feeRate,
    });
    expect(result.exceedsLimit).toBe(false);
    expect(result.inputCount).toBeGreaterThanOrEqual(10);
    expect(result.maxAmountWithinLimit).toBeNull();
  });
});

describe(assertLedgerBitcoinInputLimit.name, () => {
  test('that exactly the limit is allowed', () => {
    expect(() => assertLedgerBitcoinInputLimit(LEDGER_BITCOIN_MAX_INPUTS)).not.toThrow();
  });

  test('that one over the limit throws with both counts in the message', () => {
    expect(() => assertLedgerBitcoinInputLimit(LEDGER_BITCOIN_MAX_INPUTS + 1)).toThrow(
      `${LEDGER_BITCOIN_MAX_INPUTS} inputs per transaction; this transaction has ${LEDGER_BITCOIN_MAX_INPUTS + 1}`
    );
  });
});
