import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import type { EmilySbtcLimitsResponse } from '../infrastructure/api/emily/emily-api.types';
import {
  calculateSignerSweepTxFee,
  classifySbtcNotifyError,
  getRemainingSbtcSupply,
  getSbtcBridgeExecutionConstraints,
  sbtcStacksAddressMap,
  toXOnlyPublicKeyHex,
} from './sbtc-bridge-swap-provider.utils';

const xOnlySignersPublicKey = '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';

function createAxiosError(status: number | undefined, data?: unknown, message = 'Request failed') {
  const response: AxiosResponse | undefined =
    status === undefined
      ? undefined
      : { data, status, statusText: '', headers: {}, config: { headers: new AxiosHeaders() } };
  return new AxiosError(
    message,
    status === undefined ? 'ECONNABORTED' : 'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    response
  );
}

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

    it('should return supply-cap-exceeded when deposit exceeds the remaining supply', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'deposit',
        bridgeAmount: new BigNumber(50000),
        sbtcLimits: mockSbtcLimits,
        remainingSupply: new BigNumber(40000),
      });
      expect(result).toHaveLength(1);
      expect(result[0].reason).toBe('supply-cap-exceeded');
      expect(result[0].threshold.amount.toString()).toBe('40000');
    });

    it('should prefer the per-deposit cap over the remaining supply', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'deposit',
        bridgeAmount: new BigNumber(200000000),
        sbtcLimits: mockSbtcLimits,
        remainingSupply: new BigNumber(40000),
      });
      expect(result[0].reason).toBe('maximum-threshold-exceeded');
    });

    it('should return empty array when the remaining supply is unknown', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'deposit',
        bridgeAmount: new BigNumber(50000),
        sbtcLimits: mockSbtcLimits,
        remainingSupply: null,
      });
      expect(result).toEqual([]);
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

    it('should ignore the remaining supply for withdrawals', () => {
      const result = getSbtcBridgeExecutionConstraints({
        bridgeTxType: 'withdrawal',
        bridgeAmount: new BigNumber(25000000),
        sbtcLimits: mockSbtcLimits,
        remainingSupply: new BigNumber(1),
      });
      expect(result).toEqual([]);
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

describe(getRemainingSbtcSupply.name, () => {
  it('should subtract the total supply from the peg cap', () => {
    expect(getRemainingSbtcSupply(1000, new BigNumber(400))?.toString()).toBe('600');
  });

  it('should floor at zero when supply exceeds the cap', () => {
    expect(getRemainingSbtcSupply(1000, new BigNumber(1200))?.toString()).toBe('0');
  });

  it('should return null when the peg cap or supply is unknown', () => {
    expect(getRemainingSbtcSupply(null, new BigNumber(400))).toBeNull();
    expect(getRemainingSbtcSupply(1000, null)).toBeNull();
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

describe(classifySbtcNotifyError.name, () => {
  it('treats network errors and timeouts as retryable', () => {
    expect(
      classifySbtcNotifyError(createAxiosError(undefined, undefined, 'timeout of 10000ms exceeded'))
    ).toEqual({
      retryable: true,
      failure: { status: 'failed', errorMessage: 'timeout of 10000ms exceeded' },
    });
  });

  it('treats 5xx and 429 as retryable and extracts the emily message', () => {
    expect(
      classifySbtcNotifyError(createAxiosError(500, { message: 'Internal server error' }))
    ).toEqual({
      retryable: true,
      failure: { status: 'failed', errorMessage: 'Internal server error', httpStatus: 500 },
    });
    expect(classifySbtcNotifyError(createAxiosError(429, 'rate limited'))).toEqual({
      retryable: true,
      failure: { status: 'failed', errorMessage: 'Request failed', httpStatus: 429 },
    });
  });

  it('treats other 4xx as terminal', () => {
    expect(
      classifySbtcNotifyError(createAxiosError(400, { message: 'Invalid request body' }))
    ).toEqual({
      retryable: false,
      failure: { status: 'failed', errorMessage: 'Invalid request body', httpStatus: 400 },
    });
  });

  it('treats non-axios errors as terminal', () => {
    expect(classifySbtcNotifyError(new Error('parse failed'))).toEqual({
      retryable: false,
      failure: { status: 'failed', errorMessage: 'parse failed' },
    });
  });
});

describe(toXOnlyPublicKeyHex.name, () => {
  it('drops the parity byte from a 33-byte compressed key', () => {
    expect(toXOnlyPublicKeyHex(`02${xOnlySignersPublicKey}`)).toBe(xOnlySignersPublicKey);
    expect(toXOnlyPublicKeyHex(`03${xOnlySignersPublicKey}`)).toBe(xOnlySignersPublicKey);
  });

  it('accepts a 32-byte x-only key with or without a 0x prefix', () => {
    expect(toXOnlyPublicKeyHex(xOnlySignersPublicKey)).toBe(xOnlySignersPublicKey);
    expect(toXOnlyPublicKeyHex(`0x${xOnlySignersPublicKey}`)).toBe(xOnlySignersPublicKey);
  });

  it('rejects keys of any other length', () => {
    expect(() => toXOnlyPublicKeyHex('abcdef')).toThrowError(
      'Unexpected signers public key length: 6 hex characters'
    );
  });
});
