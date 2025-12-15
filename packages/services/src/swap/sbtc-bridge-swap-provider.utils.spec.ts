import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import type { EmilySbtcLimitsResponse } from '../infrastructure/api/emily/emily-api.types';
import {
  calculateSignerSweepTxFee,
  getSbtcBridgeExecutionConstraints,
  sbtcStacksAddressMap,
} from './sbtc-bridge-swap-provider.utils';

describe(getSbtcBridgeExecutionConstraints.name, () => {
  const mockSbtcLimits: EmilySbtcLimitsResponse = {
    pegCap: 1000000000,
    perDepositCap: 100000000, // 1 BTC in sats
    perDepositMinimum: 10000, // 10k sats
    perWithdrawalCap: 50000000, // 0.5 BTC in sats
    accountCaps: {},
  };

  describe('deposit constraints', () => {
    it('should return empty array when deposit amount is within limits', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'deposit',
        bridgeAmount: new BigNumber(50000),
        sbtcLimits: mockSbtcLimits,
      });
      expect(result).toEqual([]);
    });

    it('should return minimum-threshold-not-met when deposit is below minimum', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'deposit',
        bridgeAmount: new BigNumber(5000),
        sbtcLimits: mockSbtcLimits,
      });
      expect(result).toHaveLength(1);
      expect(result[0].reason).toBe('minimum-threshold-not-met');
      expect(result[0].threshold.amount.toString()).toBe('10000');
    });

    it('should return maximum-threshold-exceeded when deposit exceeds cap', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'deposit',
        bridgeAmount: new BigNumber(200000000),
        sbtcLimits: mockSbtcLimits,
      });
      expect(result).toHaveLength(1);
      expect(result[0].reason).toBe('maximum-threshold-exceeded');
      expect(result[0].threshold.amount.toString()).toBe('100000000');
    });

    it('should return empty array when limits are null', () => {
      const nullLimits: EmilySbtcLimitsResponse = {
        pegCap: null,
        perDepositCap: null,
        perDepositMinimum: null,
        perWithdrawalCap: null,
        accountCaps: {},
      };
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'deposit',
        bridgeAmount: new BigNumber(1),
        sbtcLimits: nullLimits,
      });
      expect(result).toEqual([]);
    });
  });

  describe('withdrawal constraints', () => {
    it('should return empty array when withdrawal amount is within limits', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'withdrawal',
        bridgeAmount: new BigNumber(25000000),
        sbtcLimits: mockSbtcLimits,
      });
      expect(result).toEqual([]);
    });

    it('should return maximum-threshold-exceeded when withdrawal exceeds cap', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'withdrawal',
        bridgeAmount: new BigNumber(75000000),
        sbtcLimits: mockSbtcLimits,
      });
      expect(result).toHaveLength(1);
      expect(result[0].reason).toBe('maximum-threshold-exceeded');
      expect(result[0].threshold.amount.toString()).toBe('50000000');
    });

    it('should not check minimum threshold for withdrawals', () => {
      // Even very small amounts should pass (no minimum for withdrawals)
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'withdrawal',
        bridgeAmount: new BigNumber(1),
        sbtcLimits: mockSbtcLimits,
      });
      expect(result).toEqual([]);
    });
  });
});

describe(calculateSignerSweepTxFee.name, () => {
  it('should calculate deposit sweep fee correctly', () => {
    const feeRate = 10; // 10 sat/vB
    const result = calculateSignerSweepTxFee('deposit', feeRate);
    // deposit uses 250 vBytes
    expect(result).toBe(2500);
  });

  it('should calculate withdrawal sweep fee correctly', () => {
    const feeRate = 10; // 10 sat/vB
    const result = calculateSignerSweepTxFee('withdrawal', feeRate);
    // withdrawal uses 170 vBytes
    expect(result).toBe(1700);
  });

  it('should handle high fee rates', () => {
    const feeRate = 100;
    expect(calculateSignerSweepTxFee('deposit', feeRate)).toBe(25000);
    expect(calculateSignerSweepTxFee('withdrawal', feeRate)).toBe(17000);
  });

  it('should handle zero fee rate', () => {
    expect(calculateSignerSweepTxFee('deposit', 0)).toBe(0);
    expect(calculateSignerSweepTxFee('withdrawal', 0)).toBe(0);
  });

  it('should handle decimal fee rates', () => {
    const feeRate = 5.5;
    expect(calculateSignerSweepTxFee('deposit', feeRate)).toBe(1375);
    expect(calculateSignerSweepTxFee('withdrawal', feeRate)).toBe(935);
  });
});

describe('sbtcStacksAddressMap', () => {
  it('should have mainnet address', () => {
    expect(sbtcStacksAddressMap.mainnet).toBe('SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4');
  });

  it('should have testnet address', () => {
    expect(sbtcStacksAddressMap.testnet).toBe('SNGWPN3XDAQE673MXYXF81016M50NHF5X5PWWM70');
  });
});
