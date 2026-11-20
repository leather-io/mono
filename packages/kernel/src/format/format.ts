type CharRange = readonly [number, number];

interface CharSet {
  readonly ranges: readonly CharRange[];
  readonly negated: boolean;
}

type Shape =
  | { readonly kind: 'number'; readonly base: number; readonly width: number | undefined }
  | {
      readonly kind: 'chars';
      readonly set: CharSet;
      readonly minLength: number;
      readonly maxLength: number;
    }
  | { readonly kind: 'prefixed'; readonly text: string; readonly inner: Shape }
  | { readonly kind: 'optionalSuffix'; readonly mark: string; readonly inner: Shape }
  | {
      readonly kind: 'separated';
      readonly separator: string;
      readonly minCount: number;
      readonly item: Shape;
    }
  | {
      readonly kind: 'split';
      readonly separator: string;
      readonly first: Shape;
      readonly second: Shape;
    };

type Value =
  | { readonly kind: 'nat'; readonly value: number }
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'bool'; readonly value: boolean }
  | { readonly kind: 'list'; readonly items: readonly Value[] }
  | { readonly kind: 'pair'; readonly first: Value; readonly second: Value };

const digitChars = '0123456789abcdef';
const minBase = 2;
const maxBase = 16;
const maxDigits = 53;
const firstSurrogate = 0xd800;
const lastSurrogate = 0xdfff;

function invalidText(): RangeError {
  return new RangeError('Text is not valid for this format.');
}

function shapeMismatch(): TypeError {
  return new TypeError('Value does not match the format shape.');
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
  const codePoint = character.codePointAt(0) ?? 0;
  const inRanges = set.ranges.some(([low, high]) => low <= codePoint && codePoint <= high);
  return inRanges !== set.negated;
}

function alphabet(shape: Shape, character: string): boolean {
  if (shape.kind === 'number') return digitChars.slice(0, shape.base).includes(character);
  if (shape.kind === 'chars') return setContains(shape.set, character);
  if (shape.kind === 'prefixed')
    return codePoints(shape.text).includes(character) || alphabet(shape.inner, character);
  if (shape.kind === 'optionalSuffix')
    return character === shape.mark || alphabet(shape.inner, character);
  if (shape.kind === 'separated')
    return character === shape.separator || alphabet(shape.item, character);
  return (
    character === shape.separator ||
    alphabet(shape.first, character) ||
    alphabet(shape.second, character)
  );
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

function isValidChars(shape: Extract<Shape, { kind: 'chars' }>, text: string): boolean {
  const characters = codePoints(text);
  return (
    characters.every(character => setContains(shape.set, character)) &&
    shape.minLength <= characters.length &&
    characters.length <= shape.maxLength
  );
}

function printValue(shape: Shape, value: Value): string {
  if (shape.kind === 'number' && value.kind === 'nat')
    return printNumber(shape.base, shape.width, value.value);
  if (shape.kind === 'chars' && value.kind === 'text') {
    if (!isValidChars(shape, value.value))
      throw new RangeError('Text must use only the characters and length of its format.');
    return value.value;
  }
  if (shape.kind === 'prefixed') return shape.text + printValue(shape.inner, value);
  if (shape.kind === 'optionalSuffix' && value.kind === 'pair' && value.second.kind === 'bool') {
    const body = printValue(shape.inner, value.first);
    return value.second.value ? body + shape.mark : body;
  }
  if (shape.kind === 'separated' && value.kind === 'list') {
    if (value.items.length === 0 || value.items.length < shape.minCount)
      throw new RangeError('List must have at least the item count of its format.');
    const { item } = shape;
    return value.items.map(element => printValue(item, element)).join(shape.separator);
  }
  if (shape.kind === 'split' && value.kind === 'pair')
    return (
      printValue(shape.first, value.first) +
      shape.separator +
      printValue(shape.second, value.second)
    );
  throw shapeMismatch();
}

function parseValue(shape: Shape, text: string): Value {
  if (shape.kind === 'number')
    return { kind: 'nat', value: parseNumber(shape.base, shape.width, text) };
  if (shape.kind === 'chars') {
    if (!isValidChars(shape, text)) throw invalidText();
    return { kind: 'text', value: text };
  }
  if (shape.kind === 'prefixed') {
    if (!text.startsWith(shape.text)) throw invalidText();
    return parseValue(shape.inner, text.slice(shape.text.length));
  }
  if (shape.kind === 'optionalSuffix') {
    const marked = text.endsWith(shape.mark);
    const body = marked ? text.slice(0, text.length - shape.mark.length) : text;
    return {
      kind: 'pair',
      first: parseValue(shape.inner, body),
      second: { kind: 'bool', value: marked },
    };
  }
  if (shape.kind === 'separated') {
    const { item } = shape;
    const items = text.split(shape.separator).map(piece => parseValue(item, piece));
    if (items.length < shape.minCount) throw invalidText();
    return { kind: 'list', items };
  }
  const cut = text.indexOf(shape.separator);
  if (cut < 0) throw invalidText();
  return {
    kind: 'pair',
    first: parseValue(shape.first, text.slice(0, cut)),
    second: parseValue(shape.second, text.slice(cut + shape.separator.length)),
  };
}

interface Conversions<T> {
  toValue(input: T): Value;
  fromValue(value: Value): T;
}

class Format<T> {
  readonly shape: Shape;
  private readonly conversions: Conversions<T>;

  constructor(shape: Shape, conversions: Conversions<T>) {
    this.shape = Object.freeze(shape);
    this.conversions = conversions;
  }

  toValue(input: T): Value {
    return this.conversions.toValue(input);
  }

  fromValue(value: Value): T {
    return this.conversions.fromValue(value);
  }

  print(input: T): string {
    return printValue(this.shape, this.toValue(input));
  }

  parse(text: string): T {
    codePoints(text);
    return this.fromValue(parseValue(this.shape, text));
  }
}

export type { Format };

const natConversions: Conversions<number> = {
  toValue(input) {
    return { kind: 'nat', value: input };
  },
  fromValue(value) {
    if (value.kind !== 'nat') throw shapeMismatch();
    return value.value;
  },
};

const textConversions: Conversions<string> = {
  toValue(input) {
    return { kind: 'text', value: input };
  },
  fromValue(value) {
    if (value.kind !== 'text') throw shapeMismatch();
    return value.value;
  },
};

function isLength(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function numeral(base: number, width?: number): Format<number> {
  if (!Number.isInteger(base) || base < minBase || base > maxBase)
    throw new RangeError('Number base must be between 2 and 16.');
  if (width !== undefined && (!isLength(width) || width === 0))
    throw new RangeError('Number width must be a positive safe integer.');
  return new Format({ kind: 'number', base, width }, natConversions);
}

function rangeOf(range: string): CharRange {
  const [low, high = low] = codePoints(range).map(character => character.codePointAt(0) ?? 0);
  if (low === undefined || codePoints(range).length > 2)
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
  return new Format({ kind: 'chars', set, minLength, maxLength }, textConversions);
}

export function prefixed<T>(text: string, inner: Format<T>): Format<T> {
  codePoints(text);
  return new Format<T>(
    { kind: 'prefixed', text, inner: inner.shape },
    {
      toValue(input) {
        return inner.toValue(input);
      },
      fromValue(value) {
        return inner.fromValue(value);
      },
    }
  );
}

function refuseDelimiterInside(shape: Shape, delimiter: string): void {
  if (alphabet(shape, delimiter))
    throw new RangeError('The part before a delimiter must not be able to contain it.');
}

export function optionalSuffix<T>(mark: string, inner: Format<T>): Format<[T, boolean]> {
  refuseDelimiterInside(inner.shape, singleCharacter(mark));
  return new Format<[T, boolean]>(
    { kind: 'optionalSuffix', mark, inner: inner.shape },
    {
      toValue(input) {
        if (!Array.isArray(input)) throw new TypeError('Pair must be an array.');
        return {
          kind: 'pair',
          first: inner.toValue(input[0]),
          second: { kind: 'bool', value: input[1] },
        };
      },
      fromValue(value) {
        if (value.kind !== 'pair' || value.second.kind !== 'bool') throw shapeMismatch();
        return [inner.fromValue(value.first), value.second.value];
      },
    }
  );
}

interface CountLimits {
  minCount?: number;
}

export function separated<T>(
  separator: string,
  item: Format<T>,
  { minCount = 1 }: CountLimits = {}
): Format<T[]> {
  refuseDelimiterInside(item.shape, singleCharacter(separator));
  if (!isLength(minCount)) throw new RangeError('Item count must be a non-negative safe integer.');
  return new Format<T[]>(
    { kind: 'separated', separator, minCount, item: item.shape },
    {
      toValue(input) {
        if (!Array.isArray(input)) throw new TypeError('List must be an array.');
        return { kind: 'list', items: input.map(element => item.toValue(element)) };
      },
      fromValue(value) {
        if (value.kind !== 'list') throw shapeMismatch();
        return value.items.map(element => item.fromValue(element));
      },
    }
  );
}

export function splitAt<A, B>(
  separator: string,
  first: Format<A>,
  second: Format<B>
): Format<[A, B]> {
  refuseDelimiterInside(first.shape, singleCharacter(separator));
  return new Format<[A, B]>(
    { kind: 'split', separator, first: first.shape, second: second.shape },
    {
      toValue(input) {
        if (!Array.isArray(input)) throw new TypeError('Pair must be an array.');
        return { kind: 'pair', first: first.toValue(input[0]), second: second.toValue(input[1]) };
      },
      fromValue(value) {
        if (value.kind !== 'pair') throw shapeMismatch();
        return [first.fromValue(value.first), second.fromValue(value.second)];
      },
    }
  );
}
