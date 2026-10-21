import { describe, expect, test } from 'vitest';

import type { OwnedUtxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { getRpcSendTransferSpendSources } from './rpc-send-transfer-spend-sources';

const nativeSegwitAddress = 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq';
const taprootAddress = 'bc1putuzj9lyfcm8fef9jpy85nmh33cxuq9u6wyuk536t9kemdk37yjqmkc0pg';
const recipientAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

function createOwnedUtxo(address: string, value: number): OwnedUtxo {
  return { address, value, txid: 'txid', vout: 0, path: '', keyOrigin: '' };
}

describe(getRpcSendTransferSpendSources.name, () => {
  test('splits the recipients total plus fee across mixed inputs', () => {
    const { summary, breakdown } = getRpcSendTransferSpendSources(
      {
        fee: 500,
        inputs: [
          createOwnedUtxo(taprootAddress, 300000),
          createOwnedUtxo(nativeSegwitAddress, 200000),
        ],
      },
      [
        { address: recipientAddress, amount: createMoney(250000, 'BTC') },
        { address: recipientAddress, amount: createMoney(150000, 'BTC') },
      ]
    );

    expect(summary.taproot.amount.toString()).toEqual('300000');
    expect(summary.nativeSegwit.amount.toString()).toEqual('200000');
    expect(breakdown.taproot.amount.toString()).toEqual('300000');
    expect(breakdown.nativeSegwit.amount.toString()).toEqual('100500');
  });

  test('excludes change from the breakdown', () => {
    const { breakdown } = getRpcSendTransferSpendSources(
      { fee: 300, inputs: [createOwnedUtxo(nativeSegwitAddress, 200000)] },
      [{ address: recipientAddress, amount: createMoney(100000, 'BTC') }]
    );

    expect(breakdown.nativeSegwit.amount.toString()).toEqual('100300');
    expect(breakdown.taproot.amount.toString()).toEqual('0');
  });

  test('includes the fee when there are no recipients', () => {
    const { breakdown } = getRpcSendTransferSpendSources(
      { fee: 300, inputs: [createOwnedUtxo(taprootAddress, 200000)] },
      []
    );

    expect(breakdown.taproot.amount.toString()).toEqual('300');
    expect(breakdown.nativeSegwit.amount.toString()).toEqual('0');
  });
});
