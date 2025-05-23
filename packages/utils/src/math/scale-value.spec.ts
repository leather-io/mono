import { scaleValue } from './scale-value';

describe('scaleValue', () => {
  it('returns 0 for 0', () => {
    expect(scaleValue(0)).toBe(0);
  });

  it('handles positive integers', () => {
    expect(scaleValue(1)).toBe(1);
    expect(scaleValue(9)).toBe(9);
    expect(scaleValue(10)).toBe(10);
    expect(scaleValue(15)).toBe(10);
    expect(scaleValue(99)).toBe(90);
    expect(scaleValue(123)).toBe(100);
    expect(scaleValue(999)).toBe(900);
    expect(scaleValue(1234)).toBe(1000);
    expect(scaleValue(9999)).toBe(9000);
    expect(scaleValue(10000)).toBe(10000);
    expect(scaleValue(123456)).toBe(100000);
    expect(scaleValue(999999)).toBe(900000);
    expect(scaleValue(1000000)).toBe(1000000);
    expect(scaleValue(9876543)).toBe(9000000);
  });

  it('handles negative integers', () => {
    expect(scaleValue(-1)).toBe(-1);
    expect(scaleValue(-9)).toBe(-9);
    expect(scaleValue(-10)).toBe(-10);
    expect(scaleValue(-15)).toBe(-10);
    expect(scaleValue(-99)).toBe(-90);
    expect(scaleValue(-123)).toBe(-100);
    expect(scaleValue(-999)).toBe(-900);
    expect(scaleValue(-1234)).toBe(-1000);
    expect(scaleValue(-9999)).toBe(-9000);
    expect(scaleValue(-10000)).toBe(-10000);
    expect(scaleValue(-123456)).toBe(-100000);
    expect(scaleValue(-999999)).toBe(-900000);
    expect(scaleValue(-1000000)).toBe(-1000000);
    expect(scaleValue(-9876543)).toBe(-9000000);
  });

  it('handles positive decimals', () => {
    expect(scaleValue(0.9)).toBe(0.9);
    expect(scaleValue(0.5)).toBe(0.5);
    expect(scaleValue(0.04)).toBe(0.04);
    expect(scaleValue(0.045)).toBe(0.04);
    expect(scaleValue(0.00789)).toBe(0.007);
    expect(scaleValue(0.000789)).toBe(0.0007);
    expect(scaleValue(0.0000123)).toBe(0.00001);
  });

  it('handles negative decimals', () => {
    expect(scaleValue(-0.9)).toBe(-0.9);
    expect(scaleValue(-0.5)).toBe(-0.5);
    expect(scaleValue(-0.04)).toBe(-0.04);
    expect(scaleValue(-0.045)).toBe(-0.04);
    expect(scaleValue(-0.00789)).toBe(-0.007);
    expect(scaleValue(-0.000789)).toBe(-0.0007);
    expect(scaleValue(-0.0000123)).toBe(-0.00001);
  });
});
