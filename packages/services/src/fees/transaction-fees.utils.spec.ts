import { describe, expect, it } from 'vitest';

import {
  calculateFeeRate,
  enforceFeeBounds,
  enforceFeeMaximum,
  enforceFeeMinimum,
} from './transaction-fees.utils';

describe(calculateFeeRate.name, () => {
  it('should calculate fee rate correctly for normal values', () => {
    expect(calculateFeeRate(1000, 250)).toBe(4);
    expect(calculateFeeRate(500, 200)).toBe(3);
    expect(calculateFeeRate(100, 50)).toBe(2);
  });

  it('should round up to nearest integer', () => {
    expect(calculateFeeRate(1000, 300)).toBe(4);
    expect(calculateFeeRate(1000, 400)).toBe(3);
    expect(calculateFeeRate(1000, 500)).toBe(2);
  });

  it('should handle decimal inputs', () => {
    expect(calculateFeeRate(1000.5, 250)).toBe(5);
    expect(calculateFeeRate(1000, 250.5)).toBe(4);
  });

  it('should handle very small values', () => {
    expect(calculateFeeRate(1, 1000)).toBe(1);
    expect(calculateFeeRate(0.1, 1000)).toBe(1);
  });

  it('should handle zero fee', () => {
    expect(calculateFeeRate(0, 250)).toBe(0);
  });

  it('should handle very large values', () => {
    expect(calculateFeeRate(1000000, 1000)).toBe(1000);
    expect(calculateFeeRate(1000000, 1)).toBe(1000000);
  });
});

describe(enforceFeeMinimum.name, () => {
  it('should return the fee when it is above minimum', () => {
    expect(enforceFeeMinimum(1000, 500)).toBe(1000);
    expect(enforceFeeMinimum(100, 50)).toBe(100);
  });

  it('should return the minimum when fee is below minimum', () => {
    expect(enforceFeeMinimum(100, 500)).toBe(500);
    expect(enforceFeeMinimum(50, 100)).toBe(100);
  });

  it('should handle decimal values', () => {
    expect(enforceFeeMinimum(100.5, 200)).toBe(200);
    expect(enforceFeeMinimum(200.5, 100)).toBe(200.5);
  });
});

describe(enforceFeeMaximum.name, () => {
  it('should return the fee when it is below maximum', () => {
    expect(enforceFeeMaximum(1000, 2000)).toBe(1000);
    expect(enforceFeeMaximum(100, 500)).toBe(100);
  });

  it('should return the maximum when fee is above maximum', () => {
    expect(enforceFeeMaximum(2000, 1000)).toBe(1000);
    expect(enforceFeeMaximum(500, 100)).toBe(100);
  });

  it('should handle decimal values', () => {
    expect(enforceFeeMaximum(200.5, 100)).toBe(100);
    expect(enforceFeeMaximum(100.5, 200)).toBe(100.5);
  });
});

describe(enforceFeeBounds.name, () => {
  it('should return the fee when it is within bounds', () => {
    expect(enforceFeeBounds(1000, 500, 2000)).toBe(1000);
    expect(enforceFeeBounds(100, 50, 500)).toBe(100);
  });

  it('should enforce minimum when fee is below minimum', () => {
    expect(enforceFeeBounds(100, 500, 2000)).toBe(500);
    expect(enforceFeeBounds(50, 100, 500)).toBe(100);
  });

  it('should enforce maximum when fee is above maximum', () => {
    expect(enforceFeeBounds(3000, 500, 2000)).toBe(2000);
    expect(enforceFeeBounds(1000, 100, 500)).toBe(500);
  });

  it('should handle edge cases where minimum equals maximum', () => {
    expect(enforceFeeBounds(1000, 500, 500)).toBe(500);
    expect(enforceFeeBounds(100, 500, 500)).toBe(500);
    expect(enforceFeeBounds(1000, 500, 500)).toBe(500);
  });

  it('should handle decimal values', () => {
    expect(enforceFeeBounds(100.5, 200, 500)).toBe(200);
    expect(enforceFeeBounds(300.5, 200, 500)).toBe(300.5);
    expect(enforceFeeBounds(600.5, 200, 500)).toBe(500);
  });

  it('should handle zero values', () => {
    expect(enforceFeeBounds(0, 0, 1000)).toBe(0);
    expect(enforceFeeBounds(500, 0, 1000)).toBe(500);
    expect(enforceFeeBounds(1500, 0, 1000)).toBe(1000);
  });
});
