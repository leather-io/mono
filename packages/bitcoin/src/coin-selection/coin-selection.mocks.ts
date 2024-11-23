import { sha256 } from '@noble/hashes/sha256';
import { hexToBytes } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import { Utxo } from './coin-selection.utils';

function generateMockHex() {
  return Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padEnd(6, '0');
}

function generateMockTxId(value: number): Utxo {
  return {
    txid: sha256(sha256(hexToBytes(generateMockHex()))).toString(),
    vout: 0,
    status: {
      confirmed: true,
      block_height: 2568495,
      block_hash: '000000000000008622fafce4a5388861b252d534f819d0f7cb5d4f2c5f9c1638',
      block_time: 1703787327,
    },
    value,
  };
}

export function generateMockTransactions(values: number[]) {
  return values.map(val => generateMockTxId(val));
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
