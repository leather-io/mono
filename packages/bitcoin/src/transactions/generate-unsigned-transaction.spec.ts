import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { describe, expect, it } from 'vitest';

import { OwnedUtxo } from '@leather.io/models';
import { createMoney, hexToNumber } from '@leather.io/utils';

import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';
import { ecdsaPublicKeyToSchnorr } from '../utils/bitcoin.utils';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import {
  GenerateBitcoinUnsignedTransactionArgs,
  generateBitcoinUnsignedTransaction,
} from './generate-unsigned-transaction';

const publicKey = hex.decode('030000000000000000000000000000000000000000000000000000000000000001');
const payment = btc.p2wpkh(publicKey, btc.TEST_NETWORK);
const taprootPayment = btc.p2tr(ecdsaPublicKeyToSchnorr(publicKey), undefined, btc.TEST_NETWORK);

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
    payerLookup(keyOrigin: string) {
      return {
        paymentType: 'p2wpkh',
        address: createBitcoinAddress(payment.address!),
        keyOrigin,
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

    expect(result.inputs).toEqual(mockResult.inputs);
    expect(result.fee).toEqual(mockResult.fee);

    const psbtMagic = [0x70, 0x73, 0x62, 0x74, 0xff];
    expect(Array.from(result.psbt.slice(0, 5))).toEqual(psbtMagic);
    expect(result.hex.length).toBeGreaterThan(0);

    const psbtInput = result.tx.getInput(0);
    expect(psbtInput.bip32Derivation).toHaveLength(1);
    expect(psbtInput.bip32Derivation![0][0]).toEqual(publicKey);
    expect(psbtInput.bip32Derivation![0][1].fingerprint).toBe(hexToNumber('deadbeef'));
    expect(psbtInput.bip32Derivation![0][1].path).toEqual(btc.bip32Path("m/84'/1'/0'/0/1"));
    expect(psbtInput.tapInternalKey).toBeUndefined();
    expect(psbtInput.witnessUtxo!.script).toEqual(payment.script);
    expect(psbtInput.witnessUtxo!.amount).toBe(BigInt(200000));
  });

  it('should add change address to output correctly', () => {
    const result = generateBitcoinUnsignedTransaction(mockArgs);
    const fee = BigInt(result.fee.amount.toNumber());
    const inputTotal = BigInt(200000);

    expect(result.tx.outputsLength).toBe(2);
    expect(result.tx.getOutput(0).amount).toBe(BigInt(150000));
    expect(result.tx.getOutput(1).script).toBeDefined();

    const recipientAmount = result.tx.getOutput(0).amount!;
    const changeAmount = result.tx.getOutput(1).amount!;
    expect(recipientAmount + changeAmount + fee).toBe(inputTotal);
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

  it('should not produce change output when change would be below dust threshold', () => {
    const dustArgs: GenerateBitcoinUnsignedTransactionArgs<OwnedUtxo> = {
      ...mockArgs,
      utxos: [
        {
          address: payment.address!,
          path: "m/84'/1'/0'/0/0",
          keyOrigin: "deadbeef/84'/1'/0'/0/0",
          txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
          vout: 0,
          value: 150400,
        },
      ],
      recipients: [
        {
          address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
          amount: createMoney(150000, 'BTC'),
        },
      ],
    };

    const result = generateBitcoinUnsignedTransaction(dustArgs);
    const fee = BigInt(result.fee.amount.toNumber());

    expect(result.tx.outputsLength).toBe(1);
    expect(result.tx.getOutput(0).amount).toBe(BigInt(150000));

    // Change (150400 - 150000 - fee) is below dust, so no change output.
    // The sub-dust remainder becomes an implicit miner tip.
    const remainder = BigInt(150400) - BigInt(150000) - fee;
    expect(remainder).toBeGreaterThan(0n);
    expect(remainder).toBeLessThan(294n);
  });

  it('should build correct transaction with isSendingMax for segwit inputs', () => {
    const sendMaxArgs: GenerateBitcoinUnsignedTransactionArgs<OwnedUtxo> = {
      ...mockArgs,
      isSendingMax: true,
    };

    const result = generateBitcoinUnsignedTransaction(sendMaxArgs);

    expect(result.tx.outputsLength).toBe(1);
    expect(result.tx.getOutput(0).amount).toBe(BigInt(150000));
    expect(result.fee.amount.isGreaterThan(0)).toBe(true);
    expect(result.inputs.length).toBeGreaterThanOrEqual(1);

    const psbtInput = result.tx.getInput(0);
    expect(psbtInput.bip32Derivation).toHaveLength(1);
    expect(psbtInput.tapInternalKey).toBeUndefined();
  });

  describe('taproot inputs', () => {
    const taprootMockArgs: GenerateBitcoinUnsignedTransactionArgs<OwnedUtxo> = {
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
          address: taprootPayment.address!,
          path: "m/86'/1'/0'/0/0",
          keyOrigin: "deadbeef/86'/1'/0'/0/0",
          txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
          vout: 0,
          value: 100000,
        },
        {
          address: taprootPayment.address!,
          path: "m/86'/1'/0'/0/1",
          keyOrigin: "deadbeef/86'/1'/0'/0/1",
          txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
          vout: 1,
          value: 200000,
        },
      ],
      payerLookup(keyOrigin: string) {
        return {
          paymentType: 'p2tr' as const,
          address: createBitcoinAddress(taprootPayment.address!),
          keyOrigin,
          masterKeyFingerprint: 'deadbeef',
          network: 'testnet',
          payment: taprootPayment,
          publicKey,
        };
      },
    };

    it('should set tapInternalKey and tapBip32Derivation for p2tr inputs', () => {
      const result = generateBitcoinUnsignedTransaction(taprootMockArgs);

      expect(result.hex).toBeDefined();
      expect(result.psbt).toBeDefined();
      expect(result.inputs.length).toBe(1);

      const psbtInput = result.tx.getInput(0);

      expect(hex.encode(psbtInput.txid!)).toBe(
        'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f'
      );
      expect(psbtInput.index).toBe(1);

      expect(psbtInput.tapInternalKey).toEqual(taprootPayment.tapInternalKey);
      expect(psbtInput.tapBip32Derivation).toHaveLength(1);
      expect(psbtInput.tapBip32Derivation![0][0]).toEqual(ecdsaPublicKeyToSchnorr(publicKey));
      expect(psbtInput.tapBip32Derivation![0][1].hashes).toEqual([]);
      expect(psbtInput.tapBip32Derivation![0][1].der.fingerprint).toBe(hexToNumber('deadbeef'));
      expect(psbtInput.tapBip32Derivation![0][1].der.path).toEqual(
        btc.bip32Path("m/86'/1'/0'/0/1")
      );
      expect(psbtInput.bip32Derivation).toBeUndefined();
      expect(psbtInput.witnessUtxo!.script).toEqual(taprootPayment.script);
      expect(psbtInput.witnessUtxo!.amount).toBe(BigInt(200000));

      expect(result.tx.outputsLength).toBe(2);
      expect(result.tx.getOutput(0).amount).toBe(BigInt(150000));
    });

    it('should handle mixed p2wpkh and p2tr inputs', () => {
      const mixedArgs: GenerateBitcoinUnsignedTransactionArgs<OwnedUtxo> = {
        feeRate: 1,
        isSendingMax: false,
        network: getBtcSignerLibNetworkConfigByMode('testnet'),
        changeAddress: createBitcoinAddress(payment.address!),
        recipients: [
          {
            address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
            amount: createMoney(350000, 'BTC'),
          },
        ],
        utxos: [
          {
            address: payment.address!,
            path: "m/84'/1'/0'/0/0",
            keyOrigin: "deadbeef/84'/1'/0'/0/0",
            txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
            vout: 0,
            value: 300000,
          },
          {
            address: taprootPayment.address!,
            path: "m/86'/1'/0'/0/0",
            keyOrigin: "deadbeef/86'/1'/0'/0/0",
            txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
            vout: 1,
            value: 200000,
          },
        ],
        payerLookup(keyOrigin: string) {
          if (keyOrigin.includes("86'")) {
            return {
              paymentType: 'p2tr' as const,
              address: createBitcoinAddress(taprootPayment.address!),
              keyOrigin,
              masterKeyFingerprint: 'deadbeef',
              network: 'testnet',
              payment: taprootPayment,
              publicKey,
            };
          }
          return {
            paymentType: 'p2wpkh' as const,
            address: createBitcoinAddress(payment.address!),
            keyOrigin,
            masterKeyFingerprint: 'deadbeef',
            network: 'testnet',
            payment: { script: payment.script, type: 'p2wpkh' },
            publicKey,
          };
        },
      };

      const result = generateBitcoinUnsignedTransaction(mixedArgs);

      expect(result.inputs.length).toBe(2);
      expect(result.fee.amount.isGreaterThan(0)).toBe(true);

      const segwitInput = result.tx.getInput(0);
      expect(segwitInput.index).toBe(0);
      expect(segwitInput.bip32Derivation).toBeDefined();
      expect(segwitInput.tapInternalKey).toBeUndefined();
      expect(segwitInput.witnessUtxo!.script).toEqual(payment.script);
      expect(segwitInput.witnessUtxo!.amount).toBe(BigInt(300000));

      const taprootInput = result.tx.getInput(1);
      expect(taprootInput.index).toBe(1);
      expect(taprootInput.tapBip32Derivation).toBeDefined();
      expect(taprootInput.tapInternalKey).toEqual(taprootPayment.tapInternalKey);
      expect(taprootInput.bip32Derivation).toBeUndefined();
      expect(taprootInput.witnessUtxo!.script).toEqual(taprootPayment.script);
      expect(taprootInput.witnessUtxo!.amount).toBe(BigInt(200000));
    });

    it('should use native segwit change address even with all taproot inputs', () => {
      const result = generateBitcoinUnsignedTransaction(taprootMockArgs);

      expect(result.tx.outputsLength).toBe(2);

      const changeScript = result.tx.getOutput(1).script!;
      expect(changeScript[0]).toBe(0x00);
      expect(changeScript[1]).toBe(0x14);
      expect(changeScript.length).toBe(22);
    });

    it('should build psbt with isSendingMax for taproot inputs', () => {
      const sendMaxArgs: GenerateBitcoinUnsignedTransactionArgs<OwnedUtxo> = {
        feeRate: 1,
        isSendingMax: true,
        network: getBtcSignerLibNetworkConfigByMode('testnet'),
        changeAddress: createBitcoinAddress(payment.address!),
        recipients: [
          {
            address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
            amount: createMoney(1, 'BTC'),
          },
        ],
        utxos: [
          {
            address: taprootPayment.address!,
            path: "m/86'/1'/0'/0/0",
            keyOrigin: "deadbeef/86'/1'/0'/0/0",
            txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
            vout: 0,
            value: 200000,
          },
        ],
        payerLookup(keyOrigin: string) {
          return {
            paymentType: 'p2tr' as const,
            address: createBitcoinAddress(taprootPayment.address!),
            keyOrigin,
            masterKeyFingerprint: 'deadbeef',
            network: 'testnet',
            payment: taprootPayment,
            publicKey,
          };
        },
      };

      const result = generateBitcoinUnsignedTransaction(sendMaxArgs);

      expect(result.inputs.length).toBe(1);
      expect(result.tx.outputsLength).toBe(1);

      expect(result.tx.getOutput(0).amount).toBe(1n);
      expect(result.fee.amount.isGreaterThan(0)).toBe(true);

      const psbtInput = result.tx.getInput(0);
      expect(psbtInput.tapInternalKey).toEqual(taprootPayment.tapInternalKey);
      expect(psbtInput.tapBip32Derivation).toHaveLength(1);
    });

    it('should skip inputs when payerLookup returns undefined', () => {
      const undefinedPayerArgs: GenerateBitcoinUnsignedTransactionArgs<OwnedUtxo> = {
        feeRate: 1,
        isSendingMax: false,
        network: getBtcSignerLibNetworkConfigByMode('testnet'),
        changeAddress: createBitcoinAddress(payment.address!),
        recipients: [
          {
            address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
            amount: createMoney(250000, 'BTC'),
          },
        ],
        utxos: [
          {
            address: taprootPayment.address!,
            path: "m/86'/1'/0'/0/0",
            keyOrigin: "deadbeef/86'/1'/0'/0/0",
            txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
            vout: 0,
            value: 200000,
          },
          {
            address: taprootPayment.address!,
            path: "m/86'/1'/0'/0/1",
            keyOrigin: "deadbeef/86'/1'/0'/0/1",
            txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
            vout: 1,
            value: 100000,
          },
        ],
        payerLookup(keyOrigin: string) {
          if (keyOrigin === "deadbeef/86'/1'/0'/0/1") return undefined;
          return {
            paymentType: 'p2tr' as const,
            address: createBitcoinAddress(taprootPayment.address!),
            keyOrigin,
            masterKeyFingerprint: 'deadbeef',
            network: 'testnet',
            payment: taprootPayment,
            publicKey,
          };
        },
      };

      const result = generateBitcoinUnsignedTransaction(undefinedPayerArgs);

      expect(result.inputs.length).toBe(2);
      expect(result.tx.inputsLength).toBe(1);
      expect(result.tx.getInput(0).tapInternalKey).toEqual(taprootPayment.tapInternalKey);

      // Known limitation: coin selection computed fee for 2 inputs but only 1
      // was added to the tx, producing an unbroadcastable transaction where
      // total output value exceeds the single input's value
      const singleInputValue = BigInt(200000);
      let totalOutputValue = 0n;
      for (let i = 0; i < result.tx.outputsLength; i++) {
        totalOutputValue += result.tx.getOutput(i).amount!;
      }
      expect(totalOutputValue).toBeGreaterThan(singleInputValue);
    });
  });
});
