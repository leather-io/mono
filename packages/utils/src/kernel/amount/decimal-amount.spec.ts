import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import { maxOfBits } from '../integer/integer';
import { decimalAmount } from './decimal-amount';

const runs = 2000;
const btc = decimalAmount(8, { bits: 64 });
const stx = decimalAmount(6, { bits: 128 });
const whole = decimalAmount(0, { bits: 64 });
const wei = decimalAmount(18, { bits: 256 });

function attempt<T>(run: () => T): T | undefined {
  try {
    return run();
  } catch {
    return undefined;
  }
}

const decimalsArbitrary = fc.constantFrom(0, 1, 2, 6, 8, 18);
const bitsArbitrary = fc.constantFrom(8, 64, 128);
const valueArbitrary = fc.oneof(
  fc.bigInt({ min: 0n, max: 2n ** 130n }),
  fc.bigInt({ min: 0n, max: 100000n }),
  fc.constantFrom(0n, 1n, 10n, 100000000n, 2n ** 64n - 1n, 2n ** 64n)
);
const looseTextArbitrary = fc.oneof(
  fc
    .tuple(
      fc.array(fc.constantFrom(...'0123456789'), { maxLength: 12 }),
      fc.array(fc.constantFrom(...'0123456789'), { maxLength: 20 }),
      fc.boolean()
    )
    .map(([left, right, hasPoint]) => left.join('') + (hasPoint ? '.' : '') + right.join('')),
  fc.array(fc.constantFrom(...'0159.,-+e x'), { maxLength: 8 }).map(parts => parts.join(''))
);

function referenceBaseUnits(text: string, decimals: number): bigint | undefined {
  const [left = '', right, ...extra] = text.split('.');
  if (extra.length > 0 || !/^(0|[1-9][0-9]*)$/.test(left)) return undefined;
  if (right !== undefined && !/^[0-9]+$/.test(right)) return undefined;
  const fraction = right ?? '';
  if (fraction.length > decimals) return undefined;
  return BigInt(left + fraction.padEnd(decimals, '0'));
}

describe('decimal amount', () => {
  test('converts between the text people read and whole base units', () => {
    expect(btc.parse('1.5')).toBe(150000000n);
    expect(btc.print(150000000n)).toBe('1.5');
    expect(btc.parse('0.00000001')).toBe(1n);
    expect(btc.print(1n)).toBe('0.00000001');
    expect(btc.print(0n)).toBe('0');
    expect(btc.parse('21000000')).toBe(2100000000000000n);
    expect(stx.print(1000000n)).toBe('1');
    expect(whole.parse('7')).toBe(7n);
    expect(wei.parse('1.000000000000000001')).toBe(1000000000000000001n);
  });

  test.each([
    '',
    '.',
    '.5',
    '5.',
    '01',
    '1.50',
    '1,5',
    '-1',
    '+1',
    '1e-3',
    '0x10',
    ' 1',
    '1 ',
    '1.000000001',
    'Infinity',
    'NaN',
    '1.2.3',
  ])('refuses %j as canonical text', text => {
    expect(() => btc.parse(text)).toThrow(RangeError);
  });

  test('reads typed input with trailing zeros, and nothing else that is not canonical', () => {
    expect(btc.read('1.50')).toBe(150000000n);
    expect(btc.read('1.00000000')).toBe(100000000n);
    expect(btc.read('0.0')).toBe(0n);
    for (const text of ['', '.5', '5.', '01', '1e-3', '1.000000000', '-1', ' 1'])
      expect(() => btc.read(text)).toThrow(RangeError);
  });

  test('refuses a fraction when there are no decimals, and amounts above the limit', () => {
    expect(() => whole.parse('1.0')).toThrow(RangeError);
    expect(() => whole.read('1.0')).toThrow(RangeError);
    expect(() => btc.parse('184467440737.09551616')).toThrow(RangeError);
    expect(btc.parse('184467440737.09551615')).toBe(2n ** 64n - 1n);
    expect(() => btc.print(2n ** 64n)).toThrow(RangeError);
    expect(() => btc.print(-1n)).toThrow(RangeError);
  });

  test('refuses decimals outside 0 to 77', () => {
    for (const decimals of [-1, 78, 1.5, Number.NaN])
      expect(() => decimalAmount(decimals, { bits: 64 })).toThrow(RangeError);
  });
});

describe('decimal amount properties', () => {
  test('an amount is written exactly when it is within the limit, and reads back', () => {
    fc.assert(
      fc.property(decimalsArbitrary, bitsArbitrary, valueArbitrary, (decimals, bits, value) => {
        const format = decimalAmount(decimals, { bits });
        const text = attempt(() => format.print(value));
        expect(text !== undefined).toBe(value <= maxOfBits(bits));
        if (text === undefined) return;
        expect(format.parse(text)).toBe(value);
        expect(format.read(text)).toBe(value);
        expect(referenceBaseUnits(text, decimals)).toBe(value);
      }),
      { numRuns: runs }
    );
  });

  test('canonical text is accepted exactly when it is what writing would produce', () => {
    fc.assert(
      fc.property(decimalsArbitrary, bitsArbitrary, looseTextArbitrary, (decimals, bits, text) => {
        const format = decimalAmount(decimals, { bits });
        const value = attempt(() => format.parse(text));
        const printed = value === undefined ? undefined : format.print(value);
        if (value !== undefined) expect(printed).toBe(text);
        const reference = referenceBaseUnits(text, decimals);
        const isCanonical =
          reference !== undefined &&
          reference <= maxOfBits(bits) &&
          attempt(() => format.print(reference)) === text;
        expect(value !== undefined).toBe(isCanonical);
      }),
      { numRuns: runs }
    );
  });

  test('typed text means its digits shifted by the decimals, or is refused', () => {
    fc.assert(
      fc.property(decimalsArbitrary, bitsArbitrary, looseTextArbitrary, (decimals, bits, text) => {
        const format = decimalAmount(decimals, { bits });
        const reference = referenceBaseUnits(text, decimals);
        const expected =
          reference !== undefined && reference <= maxOfBits(bits) ? reference : undefined;
        expect(attempt(() => format.read(text))).toBe(expected);
      }),
      { numRuns: runs }
    );
  });

  test('more base units never print as a smaller number', () => {
    fc.assert(
      fc.property(decimalsArbitrary, fc.bigInt({ min: 0n, max: 2n ** 60n }), (decimals, value) => {
        const format = decimalAmount(decimals, { bits: 64 });
        expect(Number(format.print(value + 1n))).toBeGreaterThanOrEqual(
          Number(format.print(value))
        );
      }),
      { numRuns: runs }
    );
  });
});
