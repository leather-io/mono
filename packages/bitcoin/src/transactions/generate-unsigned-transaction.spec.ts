import { hexToBytes } from '@noble/hashes/utils';
import { describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { getBtcSignerLibNetworkConfigByMode } from '../bitcoin.network';
import {
  GenerateBitcoinUnsignedTransactionArgs,
  generateBitcoinUnsignedTransactionNativeSegwit,
} from './generate-unsigned-transaction';

const mockResult = {
  inputs: [
    {
      address: 'tb1qt28eagxcl9gvhq2rpj5slg7dwgxae2dn2hk93m',
      txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
      vout: 1,
      value: 200000,
    },
  ],
  fee: createMoney(141, 'BTC'),
};

describe('generateBitcoinUnsignedTransactionNativeSegwit', () => {
  const mockArgs: GenerateBitcoinUnsignedTransactionArgs = {
    feeRate: 1,
    isSendingMax: false,
    network: getBtcSignerLibNetworkConfigByMode('testnet'),
    payerAddress: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
    payerPublicKey: '0329b076bc20f7b1592b2a1a5cb91dfefe8c966e50e256458e23dd2c5d63f8f1af',
    bip32Derivation: [
      [
        hexToBytes('0329b076bc20f7b1592b2a1a5cb91dfefe8c966e50e256458e23dd2c5d63f8f1af'),
        { fingerprint: 400738063, path: [2147483732, 2147483649, 2147483648, 0, 0] },
      ],
    ],
    recipients: [
      {
        address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
        amount: createMoney(150000, 'BTC'),
      },
    ],
    utxos: [
      {
        address: 'tb1qt28eagxcl9gvhq2rpj5slg7dwgxae2dn2hk93m',
        txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
        vout: 0,
        value: 100000,
      },
      {
        address: 'tb1qt28eagxcl9gvhq2rpj5slg7dwgxae2dn2hk93m',
        txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
        vout: 1,
        value: 200000,
      },
    ],
  };

  it('should generate an unsigned transaction with correct inputs and outputs', async () => {
    const result = await generateBitcoinUnsignedTransactionNativeSegwit(mockArgs);
    if (result) {
      expect(result.inputs).toEqual(mockResult.inputs);
      expect(result.fee).toEqual(mockResult.fee);
      expect(result.hex).toBeDefined();
      expect(result.psbt).toBeDefined();
    }
  });

  it('should add change address to output correctly', async () => {
    const result = await generateBitcoinUnsignedTransactionNativeSegwit(mockArgs);

    if (result) {
      expect(result.tx.outputsLength).toBe(2);
      expect(result.tx.getOutput(1).script).toBeDefined();
    }
  });

  it('should throw an error if inputs are empty', async () => {
    const argsWithNoInputs: GenerateBitcoinUnsignedTransactionArgs = {
      ...mockArgs,
      utxos: [],
    };

    await expect(() =>
      generateBitcoinUnsignedTransactionNativeSegwit(argsWithNoInputs)
    ).rejects.toThrowError('InsufficientFunds');
  });
});
