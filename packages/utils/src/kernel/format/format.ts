interface CharSet {
  readonly ranges: readonly (readonly [number, number])[];
  readonly negated: boolean;
}

interface Parts<T> {
  print(input: T): string;
  parse(text: string): T;
  canContain(character: string): boolean;
}

const digitChars = '0123456789abcdef';
const minBase = 2;
const maxBase = 16;
const maxDigits = 53;
const firstSurrogate = 0xd800;
const lastSurrogate = 0xdfff;

function invalidText(): RangeError {
  return new RangeError('Text is not valid for this format.');
}

function isLoneSurrogate(character: string): boolean {
  const codePoint = character.codePointAt(0);
  return codePoint !== undefined && codePoint >= firstSurrogate && codePoint <= lastSurrogate;
}

function codePoints(text: string): string[] {
  if (typeof text !== 'string') throw new TypeError('Text must be a string.');
  const characters = Array.from(text);
  if (characters.some(isLoneSurrogate))
    throw new TypeError('Text must not contain lone surrogates.');
  return characters;
}

function singleCharacter(text: string): string {
  if (codePoints(text).length !== 1) throw new RangeError('Expected exactly one character.');
  return text;
}

function setContains(set: CharSet, character: string): boolean {
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined) return false;
  const inRanges = set.ranges.some(([low, high]) => low <= codePoint && codePoint <= high);
  return inRanges !== set.negated;
}

function printNumber(base: number, width: number | undefined, value: number): string {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError('Number must be a non-negative safe integer that fits its format.');
  const digits = value.toString(base);
  if (width === undefined) return digits;
  if (digits.length > width)
    throw new RangeError('Number must be a non-negative safe integer that fits its format.');
  return digits.padStart(width, '0');
}

function digitsValue(base: number, characters: string[]): number {
  let value = 0n;
  for (const character of characters) {
    const digit = digitChars.indexOf(character);
    if (digit < 0 || digit >= base) throw invalidText();
    value = value * BigInt(base) + BigInt(digit);
  }
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw invalidText();
  return Number(value);
}

function parseNumber(base: number, width: number | undefined, text: string): number {
  const characters = codePoints(text);
  if (width !== undefined) {
    if (characters.length !== width) throw invalidText();
    return digitsValue(base, characters);
  }
  const isShortestForm = text === '0' || (characters.length > 0 && characters[0] !== '0');
  if (!isShortestForm || characters.length > maxDigits) throw invalidText();
  return digitsValue(base, characters);
}

function requireArray(input: unknown): readonly unknown[] {
  if (!Array.isArray(input)) throw new TypeError('Value must be an array.');
  return input;
}

class Format<T> {
  private readonly parts: Parts<T>;

  constructor(parts: Parts<T>) {
    this.parts = parts;
  }

  canContain(character: string): boolean {
    return this.parts.canContain(character);
  }

  print(input: T): string {
    return this.parts.print(input);
  }

  parse(text: string): T {
    codePoints(text);
    return this.parts.parse(text);
  }
}

export type { Format };

function isLength(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function numeral(base: number, width?: number): Format<number> {
  if (!Number.isInteger(base) || base < minBase || base > maxBase)
    throw new RangeError('Number base must be between 2 and 16.');
  if (width !== undefined && (!isLength(width) || width === 0))
    throw new RangeError('Number width must be a positive safe integer.');
  const digits = digitChars.slice(0, base);
  return new Format({
    print(input) {
      return printNumber(base, width, input);
    },
    parse(text) {
      return parseNumber(base, width, text);
    },
    canContain(character) {
      return digits.includes(character);
    },
  });
}

function rangeOf(range: string): readonly [number, number] {
  const [low, high = low] = codePoints(range).map(character => character.codePointAt(0));
  if (low === undefined || high === undefined || codePoints(range).length > 2)
    throw new RangeError('A character range is one character or a first and last character.');
  return [low, high];
}

export function charactersIn(...ranges: string[]): CharSet {
  return Object.freeze({ ranges: Object.freeze(ranges.map(rangeOf)), negated: false });
}

export function charactersExcept(...ranges: string[]): CharSet {
  return Object.freeze({ ranges: Object.freeze(ranges.map(rangeOf)), negated: true });
}

interface LengthLimits {
  minLength?: number;
  maxLength?: number;
}

export function characters(
  set: CharSet,
  { minLength = 0, maxLength = Number.MAX_SAFE_INTEGER }: LengthLimits = {}
): Format<string> {
  if (!isLength(minLength) || !isLength(maxLength))
    throw new RangeError('Length limits must be non-negative safe integers.');
  function isValid(text: string): boolean {
    const symbols = codePoints(text);
    return (
      symbols.every(symbol => setContains(set, symbol)) &&
      minLength <= symbols.length &&
      symbols.length <= maxLength
    );
  }
  return new Format({
    print(input) {
      if (!isValid(input))
        throw new RangeError('Text must use only the characters and length of its format.');
      return input;
    },
    parse(text) {
      if (!isValid(text)) throw invalidText();
      return text;
    },
    canContain(character) {
      return setContains(set, character);
    },
  });
}

export function prefixed<T>(text: string, inner: Format<T>): Format<T> {
  const prefix = codePoints(text);
  return new Format<T>({
    print(input) {
      return text + inner.print(input);
    },
    parse(whole) {
      if (!whole.startsWith(text)) throw invalidText();
      return inner.parse(whole.slice(text.length));
    },
    canContain(character) {
      return prefix.includes(character) || inner.canContain(character);
    },
  });
}

function refuseDelimiterInside(part: Format<unknown>, delimiter: string): void {
  if (part.canContain(delimiter))
    throw new RangeError('The part before a delimiter must not be able to contain it.');
}

export function optionalSuffix<T>(mark: string, inner: Format<T>): Format<[T, boolean]> {
  refuseDelimiterInside(inner, singleCharacter(mark));
  return new Format<[T, boolean]>({
    print(input) {
      requireArray(input);
      const [value, isMarked] = input;
      if (typeof isMarked !== 'boolean') throw new TypeError('The mark must be true or false.');
      return isMarked ? inner.print(value) + mark : inner.print(value);
    },
    parse(text) {
      const isMarked = text.endsWith(mark);
      const body = isMarked ? text.slice(0, text.length - mark.length) : text;
      return [inner.parse(body), isMarked];
    },
    canContain(character) {
      return character === mark || inner.canContain(character);
    },
  });
}

interface CountLimits {
  minCount?: number;
}

export function separated<T>(
  separator: string,
  item: Format<T>,
  { minCount = 1 }: CountLimits = {}
): Format<T[]> {
  refuseDelimiterInside(item, singleCharacter(separator));
  if (!isLength(minCount)) throw new RangeError('Item count must be a non-negative safe integer.');
  return new Format<T[]>({
    print(input) {
      requireArray(input);
      if (input.length === 0 || input.length < minCount)
        throw new RangeError('List must have at least the item count of its format.');
      return input.map(element => item.print(element)).join(separator);
    },
    parse(text) {
      const items = text.split(separator).map(piece => item.parse(piece));
      if (items.length < minCount) throw invalidText();
      return items;
    },
    canContain(character) {
      return character === separator || item.canContain(character);
    },
  });
}

export function splitAt<A, B>(
  separator: string,
  first: Format<A>,
  second: Format<B>
): Format<[A, B]> {
  refuseDelimiterInside(first, singleCharacter(separator));
  return new Format<[A, B]>({
    print(input) {
      requireArray(input);
      return first.print(input[0]) + separator + second.print(input[1]);
    },
    parse(text) {
      const cut = text.indexOf(separator);
      if (cut < 0) throw invalidText();
      return [first.parse(text.slice(0, cut)), second.parse(text.slice(cut + separator.length))];
    },
    canContain(character) {
      return character === separator || first.canContain(character) || second.canContain(character);
    },
  });
}

export function leading<A, B>(
  separator: string,
  first: Format<A>,
  rest: Format<B>
): Format<[A, B[]]> {
  refuseDelimiterInside(first, singleCharacter(separator));
  refuseDelimiterInside(rest, separator);
  return new Format<[A, B[]]>({
    print(input) {
      requireArray(input);
      requireArray(input[1]);
      const [head, others] = input;
      return [first.print(head), ...others.map(element => rest.print(element))].join(separator);
    },
    parse(text) {
      const [head = '', ...others] = text.split(separator);
      return [first.parse(head), others.map(piece => rest.parse(piece))];
    },
    canContain(character) {
      return character === separator || first.canContain(character) || rest.canContain(character);
    },
  });
}

type Field<Name extends string, T> = readonly [name: Name, format: Format<T>];
type NamedParts = Record<string, unknown>;

function requireNamedParts(input: NamedParts): NamedParts {
  if (typeof input !== 'object' || input === null || Array.isArray(input))
    throw new TypeError('Fields must be given as an object.');
  return input;
}

function parseNamedParts(
  separator: string,
  parts: readonly Field<string, unknown>[],
  text: string
): NamedParts {
  const [first, ...others] = parts;
  if (first === undefined) return {};
  const [name, format] = first;
  if (others.length === 0) return { [name]: format.parse(text) };
  const cut = text.indexOf(separator);
  if (cut < 0) throw invalidText();
  return {
    [name]: format.parse(text.slice(0, cut)),
    ...parseNamedParts(separator, others, text.slice(cut + separator.length)),
  };
}

function namedParts(
  separator: string,
  parts: readonly Field<string, unknown>[]
): Format<NamedParts> {
  const names = parts.map(([name]) => name);
  if (new Set(names).size !== names.length) throw new RangeError('Field names must be different.');
  if (parts.length === 0) throw new RangeError('A format needs at least one field.');
  singleCharacter(separator);
  for (const [, format] of parts.slice(0, -1)) refuseDelimiterInside(format, separator);
  return new Format<NamedParts>({
    print(input) {
      const named = requireNamedParts(input);
      return parts.map(([name, format]) => format.print(named[name])).join(separator);
    },
    parse(text) {
      return parseNamedParts(separator, parts, text);
    },
    canContain(character) {
      return character === separator || parts.some(([, format]) => format.canContain(character));
    },
  });
}

export function fields<KA extends string, A, KB extends string, B>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>
): Format<Record<KA, A> & Record<KB, B>>;
export function fields<KA extends string, A, KB extends string, B, KC extends string, C>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>
): Format<Record<KA, A> & Record<KB, B> & Record<KC, C>>;
export function fields<
  KA extends string,
  A,
  KB extends string,
  B,
  KC extends string,
  C,
  KD extends string,
  D,
>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>,
  d: Field<KD, D>
): Format<Record<KA, A> & Record<KB, B> & Record<KC, C> & Record<KD, D>>;
export function fields<
  KA extends string,
  A,
  KB extends string,
  B,
  KC extends string,
  C,
  KD extends string,
  D,
  KE extends string,
  E,
>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>,
  d: Field<KD, D>,
  e: Field<KE, E>
): Format<Record<KA, A> & Record<KB, B> & Record<KC, C> & Record<KD, D> & Record<KE, E>>;
export function fields<
  KA extends string,
  A,
  KB extends string,
  B,
  KC extends string,
  C,
  KD extends string,
  D,
  KE extends string,
  E,
  KF extends string,
  F,
>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>,
  d: Field<KD, D>,
  e: Field<KE, E>,
  f: Field<KF, F>
): Format<
  Record<KA, A> & Record<KB, B> & Record<KC, C> & Record<KD, D> & Record<KE, E> & Record<KF, F>
>;
export function fields<
  KA extends string,
  A,
  KB extends string,
  B,
  KC extends string,
  C,
  KD extends string,
  D,
  KE extends string,
  E,
  KF extends string,
  F,
  KG extends string,
  G,
>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>,
  d: Field<KD, D>,
  e: Field<KE, E>,
  f: Field<KF, F>,
  g: Field<KG, G>
): Format<
  Record<KA, A> &
    Record<KB, B> &
    Record<KC, C> &
    Record<KD, D> &
    Record<KE, E> &
    Record<KF, F> &
    Record<KG, G>
>;
export function fields(
  separator: string,
  ...parts: readonly Field<string, unknown>[]
): Format<NamedParts> {
  return namedParts(separator, parts);
}

export function fieldsThenMore<KA extends string, A, KR extends string, R>(
  separator: string,
  a: Field<KA, A>,
  more: Field<KR, R>
): Format<Record<KA, A> & Record<KR, R[]>>;
export function fieldsThenMore<KA extends string, A, KB extends string, B, KR extends string, R>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  more: Field<KR, R>
): Format<Record<KA, A> & Record<KB, B> & Record<KR, R[]>>;
export function fieldsThenMore<
  KA extends string,
  A,
  KB extends string,
  B,
  KC extends string,
  C,
  KR extends string,
  R,
>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>,
  more: Field<KR, R>
): Format<Record<KA, A> & Record<KB, B> & Record<KC, C> & Record<KR, R[]>>;
export function fieldsThenMore<
  KA extends string,
  A,
  KB extends string,
  B,
  KC extends string,
  C,
  KD extends string,
  D,
  KR extends string,
  R,
>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>,
  d: Field<KD, D>,
  more: Field<KR, R>
): Format<Record<KA, A> & Record<KB, B> & Record<KC, C> & Record<KD, D> & Record<KR, R[]>>;
export function fieldsThenMore<
  KA extends string,
  A,
  KB extends string,
  B,
  KC extends string,
  C,
  KD extends string,
  D,
  KE extends string,
  E,
  KR extends string,
  R,
>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>,
  d: Field<KD, D>,
  e: Field<KE, E>,
  more: Field<KR, R>
): Format<
  Record<KA, A> & Record<KB, B> & Record<KC, C> & Record<KD, D> & Record<KE, E> & Record<KR, R[]>
>;
export function fieldsThenMore<
  KA extends string,
  A,
  KB extends string,
  B,
  KC extends string,
  C,
  KD extends string,
  D,
  KE extends string,
  E,
  KF extends string,
  F,
  KR extends string,
  R,
>(
  separator: string,
  a: Field<KA, A>,
  b: Field<KB, B>,
  c: Field<KC, C>,
  d: Field<KD, D>,
  e: Field<KE, E>,
  f: Field<KF, F>,
  more: Field<KR, R>
): Format<
  Record<KA, A> &
    Record<KB, B> &
    Record<KC, C> &
    Record<KD, D> &
    Record<KE, E> &
    Record<KF, F> &
    Record<KR, R[]>
>;
export function fieldsThenMore(
  separator: string,
  ...parts: readonly Field<string, unknown>[]
): Format<NamedParts> {
  const fixed = parts.slice(0, -2);
  const [last, more] = parts.slice(-2);
  if (last === undefined || more === undefined)
    throw new RangeError('A format needs at least one field before the further parts.');
  const [lastName, lastFormat] = last;
  const [moreName, moreFormat] = more;
  if (parts.some(([name], index) => index < parts.length - 1 && name === moreName))
    throw new RangeError('Field names must be different.');
  const inner = namedParts(separator, [
    ...fixed,
    [lastName, leading(separator, lastFormat, moreFormat)],
  ]);
  return new Format<NamedParts>({
    print(input) {
      const named = requireNamedParts(input);
      return inner.print({ ...named, [lastName]: [named[lastName], named[moreName]] });
    },
    parse(text) {
      const named = inner.parse(text);
      const [lastValue, moreValues] = requireArray(named[lastName]);
      return { ...named, [lastName]: lastValue, [moreName]: moreValues };
    },
    canContain(character) {
      return inner.canContain(character);
    },
  });
}
