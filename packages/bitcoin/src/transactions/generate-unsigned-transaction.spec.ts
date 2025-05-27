import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { describe, expect, it } from 'vitest';

import { OwnedUtxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import {
  GenerateBitcoinUnsignedTransactionArgs,
  generateBitcoinUnsignedTransaction,
} from './generate-unsigned-transaction';

const publicKey = hex.decode('030000000000000000000000000000000000000000000000000000000000000001');
const payment = btc.p2wpkh(publicKey, btc.TEST_NETWORK);

const mockResult = {
  inputs: [
    {
      path: "m/84'/1'/0'/0/1",
      keyOrigin: "deadbeef/84'/1'/0'/0/1",
      address: payment.address!,
      txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
      vout: 1,
      value: 200000,
    },
  ],
  fee: createMoney(141, 'BTC'),
};

describe(generateBitcoinUnsignedTransaction.name, () => {
  const mockArgs: GenerateBitcoinUnsignedTransactionArgs<OwnedUtxo> = {
    feeRate: 1,
    isSendingMax: false,
    network: getBtcSignerLibNetworkConfigByMode('testnet'),
    changeAddress: createBitcoinAddress(payment.address!),
    recipients: [
      {
        address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
        amount: createMoney(150000, 'BTC'),
      },
    ],
    utxos: [
      {
        address: payment.address!,
        path: "m/84'/1'/0'/0/0",
        keyOrigin: "deadbeef/84'/1'/0'/0/0",
        txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
        vout: 0,
        value: 100000,
      },
      {
        address: payment.address!,
        path: "m/84'/1'/0'/0/1",
        keyOrigin: "deadbeef/84'/1'/0'/0/1",
        txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
        vout: 1,
        value: 200000,
      },
    ],
    payerLookup() {
      return {
        paymentType: 'p2wpkh',
        address: createBitcoinAddress(payment.address!),
        keyOrigin: "deadbeef/84'/1'/0'/0/0",
        masterKeyFingerprint: 'deadbeef',
        network: 'testnet',
        payment: {
          script: payment.script,
          type: 'p2wpkh',
        },
        publicKey,
      };
    },
  };

  it('should generate an unsigned transaction with correct inputs and outputs', () => {
    const result = generateBitcoinUnsignedTransaction(mockArgs);
    if (result) {
      expect(result.inputs).toEqual(mockResult.inputs);
      expect(result.fee).toEqual(mockResult.fee);
      expect(result.hex).toBeDefined();
      expect(result.psbt).toBeDefined();
    }
  });

  it('should add change address to output correctly', () => {
    const result = generateBitcoinUnsignedTransaction(mockArgs);

    if (result) {
      expect(result.tx.outputsLength).toBe(2);
      expect(result.tx.getOutput(1).script).toBeDefined();
    }
  });

  it('should throw an error if inputs are empty', () => {
    const argsWithNoInputs: GenerateBitcoinUnsignedTransactionArgs<any> = {
      ...mockArgs,
      utxos: [],
    };

    expect(() => generateBitcoinUnsignedTransaction(argsWithNoInputs)).toThrowError(
      'InsufficientFunds'
    );
  });
});
