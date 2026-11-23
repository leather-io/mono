type Rounding = 'floor' | 'ceil';

function refuseUnit(): TypeError {
  return new TypeError('Quantities of different units cannot be combined.');
}

class Quantity<U extends string> {
  readonly unit: U;
  readonly value: bigint;

  constructor(unit: U, value: bigint) {
    if (typeof unit !== 'string' || unit === '') throw new TypeError('Unit must be a name.');
    if (typeof value !== 'bigint') throw new TypeError('Value must be a bigint.');
    if (value < 0n) throw new RangeError('A quantity cannot be negative.');
    this.unit = unit;
    this.value = value;
    Object.freeze(this);
  }

  private valueOfSameUnit(other: Quantity<U>): bigint {
    if (!(other instanceof Quantity) || other.unit !== this.unit) throw refuseUnit();
    return other.value;
  }

  plus(other: Quantity<U>): Quantity<U> {
    return new Quantity(this.unit, this.value + this.valueOfSameUnit(other));
  }

  minus(other: Quantity<U>): Quantity<U> {
    return new Quantity(this.unit, this.value - this.valueOfSameUnit(other));
  }

  compare(other: Quantity<U>): -1 | 0 | 1 {
    const theirs = this.valueOfSameUnit(other);
    if (this.value < theirs) return -1;
    return this.value > theirs ? 1 : 0;
  }

  mulDiv(numerator: bigint, denominator: bigint, rounding: Rounding): Quantity<U> {
    if (typeof numerator !== 'bigint' || typeof denominator !== 'bigint')
      throw new TypeError('Ratio must be given as bigints.');
    if (numerator < 0n || denominator <= 0n)
      throw new RangeError('Ratio must be non-negative with a positive denominator.');
    if (rounding !== 'floor' && rounding !== 'ceil')
      throw new TypeError('Rounding must be floor or ceil.');
    const product = this.value * numerator;
    const floored = product / denominator;
    const isExact = product % denominator === 0n;
    return new Quantity(this.unit, rounding === 'floor' || isExact ? floored : floored + 1n);
  }

  clamp(min: Quantity<U>, max: Quantity<U>): Quantity<U> {
    const low = this.valueOfSameUnit(min);
    const high = this.valueOfSameUnit(max);
    if (low > high) throw new RangeError('Clamp minimum must not exceed its maximum.');
    if (this.value < low) return min;
    return this.value > high ? max : this;
  }

  times<V extends string, W extends string>(other: Quantity<V>, unit: W): Quantity<W> {
    if (!(other instanceof Quantity)) throw refuseUnit();
    return new Quantity(unit, this.value * other.value);
  }
}

export type { Quantity };

export function quantity<U extends string>(unit: U, value: bigint): Quantity<U> {
  return new Quantity(unit, value);
}

export function sumQuantities<U extends string>(unit: U, items: readonly Quantity<U>[]) {
  return items.reduce((total, item) => total.plus(item), new Quantity(unit, 0n));
}

export function settle<U extends string>(
  unit: U,
  inputs: readonly Quantity<U>[],
  outputs: readonly Quantity<U>[]
): Quantity<U> {
  return sumQuantities(unit, inputs).minus(sumQuantities(unit, outputs));
}
