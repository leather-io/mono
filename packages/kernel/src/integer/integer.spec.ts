import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import { integer, maxOfBits } from './integer';

const runs = 2000;
const u64 = integer({ bits: 64 });
const u128 = integer({ bits: 128 });
const maxU64 = 18446744073709551615n;

function attempt<T>(run: () => T): T | undefined {
  try {
    return run();
  } catch {
    return undefined;
  }
}

const bitsArbitrary = fc.constantFrom(1, 8, 53, 64, 128, 256);
const valueArbitrary = fc.oneof(
  fc.bigInt({ min: 0n, max: 2n ** 256n }),
  fc.bigInt({ min: 0n, max: 300n }),
  fc.constantFrom(0n, 1n, 255n, 256n, 2n ** 53n, maxU64, maxU64 + 1n, 2n ** 128n - 1n, 2n ** 128n)
);
const looseTextArbitrary = fc.oneof(
  fc.array(fc.constantFrom(...'0123456789'), { maxLength: 80 }).map(digits => digits.join('')),
  fc.array(fc.constantFrom(...'0129 .-+exa'), { maxLength: 6 }).map(parts => parts.join(''))
);

describe('integer', () => {
  test('reads and writes plain decimal digits', () => {
    expect(u64.parse('0')).toBe(0n);
    expect(u64.parse('18446744073709551615')).toBe(maxU64);
    expect(u64.print(1500000n)).toBe('1500000');
    expect(u128.parse('340282366920938463463374607431768211455')).toBe(2n ** 128n - 1n);
  });

  test.each([
    '',
    ' 1',
    '1 ',
    '01',
    '00',
    '-1',
    '+1',
    '1.0',
    '1e3',
    '0x10',
    '१',
    '18446744073709551616',
  ])('refuses %j as text', text => {
    expect(() => u64.parse(text)).toThrow(RangeError);
  });

  test('refuses values outside its limit when writing', () => {
    expect(() => u64.print(-1n)).toThrow(RangeError);
    expect(() => u64.print(maxU64 + 1n)).toThrow(RangeError);
  });

  test('reads a parameter only as a canonical string, a safe whole number or a bigint', () => {
    expect(u64.read('42')).toBe(42n);
    expect(u64.read(42)).toBe(42n);
    expect(u64.read(42n)).toBe(42n);
    expect(u64.read(Number.MAX_SAFE_INTEGER)).toBe(9007199254740991n);
    for (const input of ['', null, undefined, true, false, [], {}, -5, 1.5, Number.NaN, 2 ** 53])
      expect(() => u64.read(input)).toThrow(RangeError);
    for (const input of ['0x10', '1e3', ' 7', '007', Number.POSITIVE_INFINITY, -1n, maxU64 + 1n])
      expect(() => u64.read(input)).toThrow(RangeError);
  });

  test('refuses limits outside 1 to 256 bits', () => {
    for (const bits of [0, 257, 1.5, -1, Number.NaN]) expect(() => integer({ bits })).toThrow();
    expect(maxOfBits(8)).toBe(255n);
  });
});

describe('integer properties', () => {
  test('a value is written exactly when it is within the limit, and reads back', () => {
    fc.assert(
      fc.property(bitsArbitrary, valueArbitrary, (bits, value) => {
        const format = integer({ bits });
        const text = attempt(() => format.print(value));
        expect(text).toBe(value <= maxOfBits(bits) ? value.toString() : undefined);
        if (text !== undefined) expect(format.parse(text)).toBe(value);
      }),
      { numRuns: runs }
    );
  });

  test('text is accepted exactly when it is what writing would produce', () => {
    fc.assert(
      fc.property(bitsArbitrary, looseTextArbitrary, (bits, text) => {
        const format = integer({ bits });
        const value = attempt(() => format.parse(text));
        const isCanonical = /^(0|[1-9][0-9]*)$/.test(text) && BigInt(text) <= maxOfBits(bits);
        expect(value !== undefined).toBe(isCanonical);
        if (value !== undefined) expect(format.print(value)).toBe(text);
      }),
      { numRuns: runs }
    );
  });

  test('a parameter given as a number means the same as its digits', () => {
    fc.assert(
      fc.property(fc.oneof(fc.maxSafeNat(), fc.double(), fc.integer()), input => {
        const expected = Number.isSafeInteger(input) && input >= 0 ? BigInt(input) : undefined;
        expect(attempt(() => u64.read(input))).toBe(expected);
        if (expected !== undefined) expect(u64.read(expected.toString())).toBe(expected);
      }),
      { numRuns: runs }
    );
  });
});
