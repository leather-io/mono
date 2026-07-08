import { describe, expect, it } from 'vitest';

import { BtcSizeFeeEstimator } from './btc-size-fee-estimator';

describe('BtcSizeFeeEstimator', () => {
  let estimator: BtcSizeFeeEstimator;

  beforeEach(() => {
    estimator = new BtcSizeFeeEstimator();
  });

  describe('getSizeOfScriptLengthElement', () => {
    it('should return the correct size for small lengths', () => {
      expect(estimator.getSizeOfScriptLengthElement(75)).toBe(2);
    });

    it('should return the correct size for large lengths', () => {
      expect(estimator.getSizeOfScriptLengthElement(512)).toBe(3);
    });
  });

  describe('getSizeOfletInt', () => {
    it('should return 1 for values <= 0xFC', () => {
      expect(estimator.getSizeOfletInt(250)).toBe(1);
    });

    it('should return 3 for values <= 0xFFFF', () => {
      expect(estimator.getSizeOfletInt(0xabcd)).toBe(3);
    });

    it('should return 5 for values <= 0xFFFFFFFF', () => {
      expect(estimator.getSizeOfletInt(0xabcdef)).toBe(5);
    });
  });

  describe('getTxOverheadVBytes', () => {
    it('should calculate the transaction overhead correctly', () => {
      const result = estimator.getTxOverheadVBytes('p2wpkh', 1, 1);
      expect(result).toEqual(10.75);
    });
  });

  describe('prepareParams', () => {
    it('should validate and return formatted parameters', () => {
      const params = estimator.prepareParams({
        input_count: 2,
        input_script: 'p2wpkh',
        input_m: 1,
        input_n: 1,
        p2pkh_output_count: 1,
        p2sh_output_count: 1,
        p2sh_p2wpkh_output_count: 1,
        p2sh_p2wsh_output_count: 1,
        p2wpkh_output_count: 1,
        p2wsh_output_count: 1,
        p2tr_output_count: 1,
      });

      expect(params.input_count).toBe(2);
      expect(params.input_script).toBe('p2wpkh');
      expect(params.input_m).toBe(1);
      expect(params.input_n).toBe(1);
      expect(params.p2pkh_output_count).toBe(1);
      expect(params.p2sh_output_count).toBe(1);
      expect(params.p2sh_p2wpkh_output_count).toBe(1);
      expect(params.p2sh_p2wsh_output_count).toBe(1);
      expect(params.p2wpkh_output_count).toBe(1);
      expect(params.p2wsh_output_count).toBe(1);
      expect(params.p2tr_output_count).toBe(1);
    });
  });

  describe('calcTxSize', () => {
    it('should calculate transaction size correctly', () => {
      const { txVBytes, txBytes, txWeight } = estimator.calcTxSize({
        input_count: 2,
        input_script: 'p2wpkh',
        input_m: 1,
        input_n: 1,
        p2pkh_output_count: 1,
        p2sh_output_count: 1,
        p2sh_p2wpkh_output_count: 1,
        p2sh_p2wsh_output_count: 1,
        p2wpkh_output_count: 1,
        p2wsh_output_count: 1,
        p2tr_output_count: 1,
      });

      expect(txVBytes).toEqual(393.5);
      expect(txBytes).toEqual(610.5);
      expect(txWeight).toEqual(1574);
    });

    it('should calculate p2wsh multisig transaction size covering the worst-case final vsize', () => {
      const { txVBytes } = estimator.calcTxSize({
        input_count: 1,
        input_script: 'p2wsh',
        input_m: 2,
        input_n: 2,
        p2wpkh_output_count: 1,
        p2wsh_output_count: 1,
      });

      expect(txVBytes).toEqual(180.5);
      expect(Math.ceil(txVBytes)).toBeGreaterThanOrEqual(181);
    });

    it('should calculate multi-input p2wsh multisig transaction size covering the worst-case final vsize', () => {
      const { txVBytes } = estimator.calcTxSize({
        input_count: 2,
        input_script: 'p2wsh',
        input_m: 2,
        input_n: 3,
        p2wpkh_output_count: 1,
        p2wsh_output_count: 1,
      });

      expect(txVBytes).toEqual(294);
      expect(Math.ceil(txVBytes)).toBeGreaterThanOrEqual(294);
    });
  });

  describe('estimateFee', () => {
    it('should calculate the correct fee based on transaction size and fee rate', () => {
      const fee = estimator.estimateFee(250, 20);
      expect(fee).toBe(5000);
    });

    it('should return 0 fee if fee rate is 0', () => {
      const fee = estimator.estimateFee(250, 0);
      expect(fee).toBe(0);
    });
  });

  describe('formatFeeRange', () => {
    it('should format fee range correctly', () => {
      const feeRange = estimator.formatFeeRange(1000, 0.1);
      expect(feeRange).toBe('900 - 1100');
    });
  });

  describe('calcMixedInputTxSize', () => {
    it('should calculate size for p2wpkh-only inputs', () => {
      const { txVBytes, txBytes, txWeight } = estimator.calcMixedInputTxSize({
        p2wpkh_input_count: 2,
        p2tr_input_count: 0,
        p2wpkh_output_count: 1,
      });

      // overhead: 11, inputs: 2 * 67.75 = 135.5, outputs: 1 * 31 = 31
      expect(txVBytes).toEqual(177.5);
      // extraRawBytes: 3, witnessBytes: 2 * 107 = 214
      expect(txBytes).toEqual(394.5);
      expect(txWeight).toEqual(710);
    });

    it('should calculate size for p2tr-only inputs', () => {
      const { txVBytes, txBytes, txWeight } = estimator.calcMixedInputTxSize({
        p2wpkh_input_count: 0,
        p2tr_input_count: 2,
        p2tr_output_count: 1,
      });

      // overhead: 11, inputs: 2 * 57.25 = 114.5, outputs: 1 * 43 = 43
      expect(txVBytes).toEqual(168.5);
      // extraRawBytes: 3, witnessBytes: 2 * 65 = 130
      expect(txBytes).toEqual(301.5);
      expect(txWeight).toEqual(674);
    });

    it('should calculate size for mixed p2wpkh and p2tr inputs', () => {
      const { txVBytes, txBytes, txWeight } = estimator.calcMixedInputTxSize({
        p2wpkh_input_count: 1,
        p2tr_input_count: 1,
        p2wpkh_output_count: 1,
        p2tr_output_count: 1,
      });

      // overhead: 11, inputs: 1 * 67.75 + 1 * 57.25 = 125, outputs: 31 + 43 = 74
      expect(txVBytes).toEqual(210);
      // extraRawBytes: 3, witnessBytes: 107 + 65 = 172
      expect(txBytes).toEqual(385);
      expect(txWeight).toEqual(840);
    });

    it('should default optional output counts to zero', () => {
      const { txVBytes } = estimator.calcMixedInputTxSize({
        p2wpkh_input_count: 1,
        p2tr_input_count: 0,
      });

      // overhead: 10.75, inputs: 1 * 67.75, outputs: 0
      expect(txVBytes).toEqual(78.5);
    });

    it('should calculate size with multiple output types', () => {
      const { txVBytes, txBytes, txWeight } = estimator.calcMixedInputTxSize({
        p2wpkh_input_count: 2,
        p2tr_input_count: 1,
        p2pkh_output_count: 1,
        p2sh_output_count: 1,
        p2wpkh_output_count: 1,
        p2tr_output_count: 1,
      });

      // overhead: getTxOverheadVBytes('p2wpkh', 3, 4) = 4 + 1 + 1 + 4 + 1.25 = 11.25
      // inputs: 2 * 67.75 + 1 * 57.25 = 192.75
      // outputs: 34 + 32 + 31 + 43 = 140
      expect(txVBytes).toEqual(344);
      // extraRawBytes: 3.75, witnessBytes: 2 * 107 + 1 * 65 = 279
      expect(txBytes).toEqual(626.75);
      expect(txWeight).toEqual(1376);
    });
  });
});
