import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import { quantity, settle, sumQuantities } from './quantity';

const runs = 2000;
const amount = fc.bigInt({ min: 0n, max: 2n ** 80n });
const amounts = fc.array(amount, { maxLength: 6 });

function sats(value: bigint) {
  return quantity('sat', value);
}

describe('quantity', () => {
  test('adds, subtracts and compares amounts of one unit', () => {
    expect(sats(5n).plus(sats(7n)).value).toBe(12n);
    expect(sats(7n).minus(sats(5n)).value).toBe(2n);
    expect(sats(5n).compare(sats(7n))).toBe(-1);
    expect(sats(7n).compare(sats(7n))).toBe(0);
    expect(sats(9n).compare(sats(7n))).toBe(1);
    expect(sumQuantities('sat', []).value).toBe(0n);
  });

  test('refuses a negative amount, including a subtraction that would go below zero', () => {
    expect(() => sats(-1n)).toThrow(RangeError);
    expect(() => sats(5n).minus(sats(6n))).toThrow(RangeError);
  });

  test('refuses anything that is not a bigint', () => {
    for (const value of [1, 1.5, '1', null, undefined])
      expect(() => {
        Reflect.apply(quantity, undefined, ['sat', value]);
      }).toThrow(TypeError);
  });

  test('refuses to combine different units', () => {
    const rate = quantity<string>('sat/vB', 10n);
    const balance = quantity<string>('sat', 100000n);
    expect(() => rate.plus(balance)).toThrow(TypeError);
    expect(() => rate.minus(balance)).toThrow(TypeError);
    expect(() => rate.compare(balance)).toThrow(TypeError);
    expect(() => rate.clamp(balance, balance)).toThrow(TypeError);
    expect(() => settle<string>('sat', [balance], [rate])).toThrow(TypeError);
  });

  test('multiplies two quantities only into a unit the caller names', () => {
    const fee = quantity('sat/vB', 10n).times(quantity('vB', 141n), 'sat');
    expect(fee.unit).toBe('sat');
    expect(fee.value).toBe(1410n);
    expect(fee.compare(sats(1410n))).toBe(0);
  });

  test('scales by a ratio, rounding the way the caller says', () => {
    expect(sats(10n).mulDiv(1n, 3n, 'floor').value).toBe(3n);
    expect(sats(10n).mulDiv(1n, 3n, 'ceil').value).toBe(4n);
    expect(sats(9n).mulDiv(1n, 3n, 'ceil').value).toBe(3n);
    expect(() => sats(10n).mulDiv(1n, 0n, 'floor')).toThrow(RangeError);
    expect(() => sats(10n).mulDiv(-1n, 3n, 'floor')).toThrow(RangeError);
    expect(() => {
      Reflect.apply(sats(10n).mulDiv, sats(10n), [1n, 3n, 'round']);
    }).toThrow(TypeError);
  });

  test('clamps into a range and refuses a range that is upside down', () => {
    expect(sats(5n).clamp(sats(10n), sats(20n)).value).toBe(10n);
    expect(sats(25n).clamp(sats(10n), sats(20n)).value).toBe(20n);
    expect(sats(15n).clamp(sats(10n), sats(20n)).value).toBe(15n);
    expect(() => sats(15n).clamp(sats(20n), sats(10n))).toThrow(RangeError);
  });

  test('settles a transaction to its fee and refuses one that spends more than it has', () => {
    expect(settle('sat', [sats(100000n)], [sats(50000n), sats(49000n)]).value).toBe(1000n);
    expect(() => settle('sat', [sats(100n)], [sats(60n), sats(60n)])).toThrow(RangeError);
  });
});

describe('quantity properties', () => {
  test('subtracting what was added gives the start back', () => {
    fc.assert(
      fc.property(amount, amount, (a, b) => {
        expect(sats(a).plus(sats(b)).minus(sats(b)).value).toBe(a);
        expect(sats(a).plus(sats(b)).value).toBe(a + b);
      }),
      { numRuns: runs }
    );
  });

  test('subtraction is refused exactly when it would go below zero', () => {
    fc.assert(
      fc.property(amount, amount, (a, b) => {
        if (b > a) expect(() => sats(a).minus(sats(b))).toThrow(RangeError);
        else expect(sats(a).minus(sats(b)).value).toBe(a - b);
      }),
      { numRuns: runs }
    );
  });

  test('inputs equal outputs plus the fee, or the transaction is refused', () => {
    fc.assert(
      fc.property(amounts, amounts, (inputs, outputs) => {
        const totalIn = inputs.reduce((total, value) => total + value, 0n);
        const totalOut = outputs.reduce((total, value) => total + value, 0n);
        if (totalOut > totalIn) {
          expect(() => settle('sat', inputs.map(sats), outputs.map(sats))).toThrow(RangeError);
          return;
        }
        const fee = settle('sat', inputs.map(sats), outputs.map(sats));
        expect(sumQuantities('sat', outputs.map(sats)).plus(fee).value).toBe(totalIn);
      }),
      { numRuns: runs }
    );
  });

  test('scaling is within one unit of exact, on the side the caller chose, and never shrinks with more', () => {
    const ratio = fc.tuple(
      fc.bigInt({ min: 0n, max: 10n ** 12n }),
      fc.bigInt({ min: 1n, max: 10n ** 12n })
    );
    fc.assert(
      fc.property(amount, amount, ratio, (a, extra, [numerator, denominator]) => {
        const floor = sats(a).mulDiv(numerator, denominator, 'floor').value;
        const ceil = sats(a).mulDiv(numerator, denominator, 'ceil').value;
        expect(floor * denominator <= a * numerator).toBe(true);
        expect((floor + 1n) * denominator > a * numerator).toBe(true);
        expect(ceil * denominator >= a * numerator).toBe(true);
        expect(ceil - floor <= 1n).toBe(true);
        expect((ceil === floor) === ((a * numerator) % denominator === 0n)).toBe(true);
        expect(sats(a + extra).mulDiv(numerator, denominator, 'floor').value >= floor).toBe(true);
      }),
      { numRuns: runs }
    );
  });

  test('a clamped amount is always inside its range and clamping again changes nothing', () => {
    fc.assert(
      fc.property(amount, amount, amount, (value, a, b) => {
        const [low, high] = a <= b ? [a, b] : [b, a];
        const clamped = sats(value).clamp(sats(low), sats(high));
        expect(clamped.value >= low && clamped.value <= high).toBe(true);
        expect(clamped.clamp(sats(low), sats(high)).value).toBe(clamped.value);
        if (value >= low && value <= high) expect(clamped.value).toBe(value);
      }),
      { numRuns: runs }
    );
  });
});
