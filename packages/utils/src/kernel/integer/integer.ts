const canonicalDecimal = /^(0|[1-9][0-9]*)$/;
const maxBits = 256;

interface IntegerLimits {
  bits: number;
}

function refuse(): RangeError {
  return new RangeError('Not a canonical non-negative integer within its limit.');
}

class IntegerFormat {
  readonly max: bigint;
  private readonly maxDigits: number;

  constructor(max: bigint) {
    this.max = max;
    this.maxDigits = max.toString().length;
  }

  private check(value: bigint): bigint {
    if (value < 0n || value > this.max) throw refuse();
    return value;
  }

  parse(text: string): bigint {
    if (typeof text !== 'string') throw new TypeError('Text must be a string.');
    if (text.length > this.maxDigits || !canonicalDecimal.test(text)) throw refuse();
    return this.check(BigInt(text));
  }

  print(value: bigint): string {
    if (typeof value !== 'bigint') throw new TypeError('Value must be a bigint.');
    return this.check(value).toString();
  }

  read(input: unknown): bigint {
    if (typeof input === 'string') return this.parse(input);
    if (typeof input === 'bigint') return this.check(input);
    if (typeof input === 'number' && Number.isSafeInteger(input)) return this.check(BigInt(input));
    throw refuse();
  }
}

export type { IntegerFormat };

export function maxOfBits(bits: number): bigint {
  if (!Number.isInteger(bits) || bits < 1 || bits > maxBits)
    throw new RangeError('Bits must be between 1 and 256.');
  return 2n ** BigInt(bits) - 1n;
}

export function integer({ bits }: IntegerLimits): IntegerFormat {
  return new IntegerFormat(maxOfBits(bits));
}
