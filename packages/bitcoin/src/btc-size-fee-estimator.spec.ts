import { describe, expect, it } from 'vitest';

import { BtcSizeFeeEstimator } from './btc-size-fee-estimator';

describe('BtcSizeFeeEstimator', () => {
  const estimator = new BtcSizeFeeEstimator();

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

      expect(txVBytes).toEqual(393.25);
      expect(txBytes).toEqual(609.5);
      expect(txWeight).toEqual(1573);
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
});
