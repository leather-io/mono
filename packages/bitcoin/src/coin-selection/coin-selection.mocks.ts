import { sha256 } from '@noble/hashes/sha256';
import { hexToBytes } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import { CoinSelectionUtxo } from './coin-selection';

function generateMockHex() {
  return Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padEnd(6, '0');
}

function generateMockUtxo(value: number): CoinSelectionUtxo {
  return {
    address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
    txid: sha256(sha256(hexToBytes(generateMockHex()))).toString(),
    value,
    vout: 0,
  };
}

export function generateMockTransactions(values: number[]) {
  return values.map(val => generateMockUtxo(val));
}

export function generateMockAverageFee(value: number) {
  return {
    hourFee: BigNumber(value / 2),
    halfHourFee: BigNumber(value),
    fastestFee: BigNumber(value * 2),
  };
}

export const mockUtxos = generateMockTransactions([
  600, 600, 1200, 1200, 10000, 10000, 25000, 40000, 50000000,
]);

export const mockAverageFee = generateMockAverageFee(10);
