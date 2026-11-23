import { maxOfBits } from '../integer/integer';

const canonicalAmount = /^(0|[1-9][0-9]*)(?:\.([0-9]*[1-9]))?$/;
const typedAmount = /^(0|[1-9][0-9]*)(?:\.([0-9]+))?$/;
const maxDecimals = 77;
const maxTextLength = 160;

interface AmountLimits {
  bits: number;
}

function refuse(): RangeError {
  return new RangeError('Not a valid amount for this number of decimals and limit.');
}

class DecimalAmountFormat {
  readonly decimals: number;
  readonly max: bigint;
  private readonly unit: bigint;

  constructor(decimals: number, max: bigint) {
    this.decimals = decimals;
    this.max = max;
    this.unit = 10n ** BigInt(decimals);
  }

  private toBaseUnits(text: string, pattern: RegExp): bigint {
    if (typeof text !== 'string') throw new TypeError('Text must be a string.');
    if (text.length > maxTextLength) throw refuse();
    const match = pattern.exec(text);
    if (!match) throw refuse();
    const [, whole = '0', fraction = ''] = match;
    if (fraction.length > this.decimals) throw refuse();
    const scaled = fraction.padEnd(this.decimals, '0');
    const value = BigInt(whole) * this.unit + (scaled === '' ? 0n : BigInt(scaled));
    if (value > this.max) throw refuse();
    return value;
  }

  parse(text: string): bigint {
    return this.toBaseUnits(text, canonicalAmount);
  }

  read(text: string): bigint {
    return this.toBaseUnits(text, typedAmount);
  }

  print(value: bigint): string {
    if (typeof value !== 'bigint') throw new TypeError('Value must be a bigint.');
    if (value < 0n || value > this.max) throw refuse();
    const whole = (value / this.unit).toString();
    const fraction = (value % this.unit).toString().padStart(this.decimals, '0').replace(/0+$/, '');
    return fraction === '' ? whole : `${whole}.${fraction}`;
  }
}

export type { DecimalAmountFormat };

export function decimalAmount(decimals: number, { bits }: AmountLimits): DecimalAmountFormat {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > maxDecimals)
    throw new RangeError('Decimals must be between 0 and 77.');
  return new DecimalAmountFormat(decimals, maxOfBits(bits));
}
