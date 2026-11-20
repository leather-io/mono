import { concatBytes, utf8ToBytes } from '@noble/hashes/utils';

type Endian = 'big' | 'little';

type IntShape =
  | { readonly kind: 'uint'; readonly width: number; readonly endian: Endian }
  | { readonly kind: 'compactSize' };

type Shape =
  | { readonly kind: 'int'; readonly codec: IntShape }
  | { readonly kind: 'fixedBytes'; readonly length: number }
  | { readonly kind: 'bytes'; readonly length: IntShape }
  | { readonly kind: 'text'; readonly length: IntShape }
  | { readonly kind: 'constant'; readonly bytes: Uint8Array }
  | { readonly kind: 'list'; readonly count: IntShape; readonly item: Shape }
  | { readonly kind: 'pair'; readonly first: Shape; readonly second: Shape };

type Value =
  | { readonly kind: 'int'; readonly value: number }
  | { readonly kind: 'bytes'; readonly value: Uint8Array }
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'unit' }
  | { readonly kind: 'list'; readonly items: readonly Value[] }
  | { readonly kind: 'pair'; readonly first: Value; readonly second: Value };

interface Read<T> {
  readonly value: T;
  readonly offset: number;
}

const byteRange = 256;
const maxUintWidth = 8;
const firstSurrogate = 0xd800;
const lastSurrogate = 0xdfff;
const compactSizeOneByteLimit = 253;
const compactSizeTwoByteTag = 253;
const compactSizeFourByteTag = 254;
const compactSizeEightByteTag = 255;
const twoToThe16 = 2 ** 16;
const twoToThe32 = 2 ** 32;

function invalidEncoding(): RangeError {
  return new RangeError('Bytes are not a valid encoding for this codec.');
}

function shapeMismatch(): TypeError {
  return new TypeError('Value does not match the codec shape.');
}

function isByteArray(value: unknown): boolean {
  return (
    value instanceof Uint8Array ||
    (ArrayBuffer.isView(value) && value.constructor.name === 'Uint8Array')
  );
}

function littleEndianBytes(width: number, value: number): Uint8Array {
  const bytes = new Uint8Array(width);
  let remaining = value;
  for (let index = 0; index < width; index += 1) {
    bytes[index] = remaining % byteRange;
    remaining = Math.floor(remaining / byteRange);
  }
  return bytes;
}

function fromLittleEndian(bytes: Uint8Array): number {
  let value = 0n;
  for (let index = bytes.length - 1; index >= 0; index -= 1) {
    value = value * BigInt(byteRange) + BigInt(bytes[index]);
  }
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw invalidEncoding();
  return Number(value);
}

function takeExactly(count: number, bytes: Uint8Array, offset: number): Read<Uint8Array> {
  if (count > bytes.length - offset) throw invalidEncoding();
  return { value: bytes.slice(offset, offset + count), offset: offset + count };
}

function encodeUint(width: number, endian: Endian, value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0 || value >= byteRange ** width)
    throw new RangeError('Integer must be a non-negative safe integer that fits its codec.');
  const bytes = littleEndianBytes(width, value);
  return endian === 'little' ? bytes : bytes.reverse();
}

function decodeUint(width: number, endian: Endian, bytes: Uint8Array, offset: number) {
  const head = takeExactly(width, bytes, offset);
  const littleEndian = endian === 'little' ? head.value : head.value.reverse();
  return { value: fromLittleEndian(littleEndian), offset: head.offset };
}

function encodeCompactSize(value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError('Integer must be a non-negative safe integer that fits its codec.');
  if (value < compactSizeOneByteLimit) return Uint8Array.of(value);
  if (value < twoToThe16)
    return concatBytes(Uint8Array.of(compactSizeTwoByteTag), littleEndianBytes(2, value));
  if (value < twoToThe32)
    return concatBytes(Uint8Array.of(compactSizeFourByteTag), littleEndianBytes(4, value));
  return concatBytes(Uint8Array.of(compactSizeEightByteTag), littleEndianBytes(8, value));
}

function decodeCompactSizeBody(width: number, least: number, bytes: Uint8Array, offset: number) {
  const head = takeExactly(width, bytes, offset);
  const value = fromLittleEndian(head.value);
  if (value < least) throw invalidEncoding();
  return { value, offset: head.offset };
}

function decodeCompactSize(bytes: Uint8Array, offset: number): Read<number> {
  const tag = takeExactly(1, bytes, offset);
  const tagValue = tag.value[0];
  if (tagValue < compactSizeOneByteLimit) return { value: tagValue, offset: tag.offset };
  if (tagValue === compactSizeTwoByteTag)
    return decodeCompactSizeBody(2, compactSizeOneByteLimit, bytes, tag.offset);
  if (tagValue === compactSizeFourByteTag)
    return decodeCompactSizeBody(4, twoToThe16, bytes, tag.offset);
  return decodeCompactSizeBody(8, twoToThe32, bytes, tag.offset);
}

function encodeInt(codec: IntShape, value: number): Uint8Array {
  if (codec.kind === 'uint') return encodeUint(codec.width, codec.endian, value);
  return encodeCompactSize(value);
}

function decodeInt(codec: IntShape, bytes: Uint8Array, offset: number): Read<number> {
  if (codec.kind === 'uint') return decodeUint(codec.width, codec.endian, bytes, offset);
  return decodeCompactSize(bytes, offset);
}

function isLoneSurrogate(character: string): boolean {
  const codePoint = character.codePointAt(0);
  return codePoint !== undefined && codePoint >= firstSurrogate && codePoint <= lastSurrogate;
}

function utf8(text: string): Uint8Array {
  if (typeof text !== 'string') throw new TypeError('Text must be a string.');
  if (Array.from(text).some(isLoneSurrogate))
    throw new TypeError('Text must not contain lone surrogates.');
  return utf8ToBytes(text);
}

function fromUtf8(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw invalidEncoding();
  }
}

function lengthPrefixed(length: IntShape, body: Uint8Array): Uint8Array {
  if (!isByteArray(body)) throw new TypeError('Bytes must be a Uint8Array.');
  return concatBytes(encodeInt(length, body.length), body);
}

function takeLengthPrefixed(length: IntShape, bytes: Uint8Array, offset: number) {
  const count = decodeInt(length, bytes, offset);
  return takeExactly(count.value, bytes, count.offset);
}

function encodeValue(shape: Shape, value: Value): Uint8Array {
  if (shape.kind === 'int' && value.kind === 'int') return encodeInt(shape.codec, value.value);
  if (shape.kind === 'fixedBytes' && value.kind === 'bytes') {
    if (!isByteArray(value.value)) throw new TypeError('Bytes must be a Uint8Array.');
    if (value.value.length !== shape.length)
      throw new RangeError('Bytes must have the fixed length of their codec.');
    return value.value.slice();
  }
  if (shape.kind === 'bytes' && value.kind === 'bytes')
    return lengthPrefixed(shape.length, value.value);
  if (shape.kind === 'text' && value.kind === 'text')
    return lengthPrefixed(shape.length, utf8(value.value));
  if (shape.kind === 'constant' && value.kind === 'unit') return shape.bytes.slice();
  if (shape.kind === 'list' && value.kind === 'list') {
    const { item } = shape;
    return concatBytes(
      encodeInt(shape.count, value.items.length),
      ...value.items.map(element => encodeValue(item, element))
    );
  }
  if (shape.kind === 'pair' && value.kind === 'pair')
    return concatBytes(
      encodeValue(shape.first, value.first),
      encodeValue(shape.second, value.second)
    );
  throw shapeMismatch();
}

function readValue(shape: Shape, bytes: Uint8Array, offset: number): Read<Value> {
  if (shape.kind === 'int') {
    const read = decodeInt(shape.codec, bytes, offset);
    return { value: { kind: 'int', value: read.value }, offset: read.offset };
  }
  if (shape.kind === 'fixedBytes') {
    const read = takeExactly(shape.length, bytes, offset);
    return { value: { kind: 'bytes', value: read.value }, offset: read.offset };
  }
  if (shape.kind === 'bytes') {
    const read = takeLengthPrefixed(shape.length, bytes, offset);
    return { value: { kind: 'bytes', value: read.value }, offset: read.offset };
  }
  if (shape.kind === 'text') {
    const read = takeLengthPrefixed(shape.length, bytes, offset);
    return { value: { kind: 'text', value: fromUtf8(read.value) }, offset: read.offset };
  }
  if (shape.kind === 'constant') {
    const read = takeExactly(shape.bytes.length, bytes, offset);
    if (read.value.some((byte, index) => byte !== shape.bytes[index])) throw invalidEncoding();
    return { value: { kind: 'unit' }, offset: read.offset };
  }
  if (shape.kind === 'list') {
    const count = decodeInt(shape.count, bytes, offset);
    const items: Value[] = [];
    let position = count.offset;
    for (let index = 0; index < count.value; index += 1) {
      const read = readValue(shape.item, bytes, position);
      items.push(read.value);
      position = read.offset;
    }
    return { value: { kind: 'list', items }, offset: position };
  }
  const first = readValue(shape.first, bytes, offset);
  const second = readValue(shape.second, bytes, first.offset);
  return {
    value: { kind: 'pair', first: first.value, second: second.value },
    offset: second.offset,
  };
}

function decodeValue(shape: Shape, bytes: Uint8Array): Value {
  if (!isByteArray(bytes)) throw new TypeError('Bytes must be a Uint8Array.');
  const read = readValue(shape, bytes, 0);
  if (read.offset !== bytes.length) throw invalidEncoding();
  return read.value;
}

type Tail = 'bytes' | 'text';

function encodeTail(tail: Tail, value: Value): Uint8Array {
  if (tail === 'bytes' && value.kind === 'bytes') {
    if (!isByteArray(value.value)) throw new TypeError('Bytes must be a Uint8Array.');
    return value.value.slice();
  }
  if (tail === 'text' && value.kind === 'text') return utf8(value.value);
  throw shapeMismatch();
}

function decodeTail(tail: Tail, bytes: Uint8Array): Value {
  if (tail === 'bytes') return { kind: 'bytes', value: bytes };
  return { kind: 'text', value: fromUtf8(bytes) };
}

function minimumIntSize(codec: IntShape): number {
  return codec.kind === 'uint' ? codec.width : 1;
}

function minimumSize(shape: Shape): number {
  if (shape.kind === 'int') return minimumIntSize(shape.codec);
  if (shape.kind === 'fixedBytes') return shape.length;
  if (shape.kind === 'bytes' || shape.kind === 'text') return minimumIntSize(shape.length);
  if (shape.kind === 'constant') return shape.bytes.length;
  if (shape.kind === 'list') return minimumIntSize(shape.count);
  return minimumSize(shape.first) + minimumSize(shape.second);
}

interface Conversions<T> {
  toValue(input: T): Value;
  fromValue(value: Value): T;
}

class Codec<T> {
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

  encode(input: T): Uint8Array {
    return encodeValue(this.shape, this.toValue(input));
  }

  decode(bytes: Uint8Array): T {
    return this.fromValue(decodeValue(this.shape, bytes));
  }
}

const intConversions: Conversions<number> = {
  toValue(input) {
    return { kind: 'int', value: input };
  },
  fromValue(value) {
    if (value.kind !== 'int') throw shapeMismatch();
    return value.value;
  },
};

const bytesConversions: Conversions<Uint8Array> = {
  toValue(input) {
    return { kind: 'bytes', value: input };
  },
  fromValue(value) {
    if (value.kind !== 'bytes') throw shapeMismatch();
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

const unitConversions: Conversions<undefined> = {
  toValue() {
    return { kind: 'unit' };
  },
  fromValue(value) {
    if (value.kind !== 'unit') throw shapeMismatch();
    return undefined;
  },
};

class IntCodec extends Codec<number> {
  readonly intShape: IntShape;

  constructor(intShape: IntShape) {
    super({ kind: 'int', codec: intShape }, intConversions);
    this.intShape = Object.freeze(intShape);
  }
}

export type { Codec, IntCodec };

export function uint(width: number, endian: Endian): IntCodec {
  if (!Number.isInteger(width) || width < 1 || width > maxUintWidth)
    throw new RangeError('Integer width must be between 1 and 8 bytes.');
  return new IntCodec({ kind: 'uint', width, endian });
}

export const compactSize: IntCodec = new IntCodec({ kind: 'compactSize' });

export function fixedBytes(length: number): Codec<Uint8Array> {
  if (!Number.isSafeInteger(length) || length < 0)
    throw new RangeError('Fixed length must be a non-negative safe integer.');
  return new Codec({ kind: 'fixedBytes', length }, bytesConversions);
}

export function bytes(length: IntCodec): Codec<Uint8Array> {
  return new Codec({ kind: 'bytes', length: length.intShape }, bytesConversions);
}

export function text(length: IntCodec): Codec<string> {
  return new Codec({ kind: 'text', length: length.intShape }, textConversions);
}

export function constant(value: Uint8Array): Codec<undefined> {
  if (!isByteArray(value)) throw new TypeError('Bytes must be a Uint8Array.');
  return new Codec({ kind: 'constant', bytes: value.slice() }, unitConversions);
}

export function list<T>(count: IntCodec, item: Codec<T>): Codec<T[]> {
  if (minimumSize(item.shape) === 0)
    throw new RangeError('List items must take at least one byte.');
  return new Codec<T[]>(
    { kind: 'list', count: count.intShape, item: item.shape },
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

function pair<A, B>(first: Codec<A>, second: Codec<B>): Codec<[A, B]> {
  return new Codec<[A, B]>(
    { kind: 'pair', first: first.shape, second: second.shape },
    {
      toValue(input) {
        if (!Array.isArray(input)) throw new TypeError('Tuple must be an array.');
        return {
          kind: 'pair',
          first: first.toValue(input[0]),
          second: second.toValue(input[1]),
        };
      },
      fromValue(value) {
        if (value.kind !== 'pair') throw shapeMismatch();
        return [first.fromValue(value.first), second.fromValue(value.second)];
      },
    }
  );
}

function relabelled<T, U>(codec: Codec<T>, conversions: { to(input: U): T; from(value: T): U }) {
  return new Codec<U>(codec.shape, {
    toValue(input) {
      if (!Array.isArray(input)) throw new TypeError('Tuple must be an array.');
      return codec.toValue(conversions.to(input));
    },
    fromValue(value) {
      return conversions.from(codec.fromValue(value));
    },
  });
}

function triple<A, B, C>(a: Codec<A>, b: Codec<B>, c: Codec<C>): Codec<[A, B, C]> {
  return relabelled<[A, [B, C]], [A, B, C]>(pair(a, pair(b, c)), {
    to([x, y, z]) {
      return [x, [y, z]];
    },
    from([x, [y, z]]) {
      return [x, y, z];
    },
  });
}

function quadruple<A, B, C, D>(
  a: Codec<A>,
  b: Codec<B>,
  c: Codec<C>,
  d: Codec<D>
): Codec<[A, B, C, D]> {
  return relabelled<[A, [B, C, D]], [A, B, C, D]>(pair(a, triple(b, c, d)), {
    to([w, x, y, z]) {
      return [w, [x, y, z]];
    },
    from([w, [x, y, z]]) {
      return [w, x, y, z];
    },
  });
}

function quintuple<A, B, C, D, E>(
  a: Codec<A>,
  b: Codec<B>,
  c: Codec<C>,
  d: Codec<D>,
  e: Codec<E>
): Codec<[A, B, C, D, E]> {
  return relabelled<[A, [B, C, D, E]], [A, B, C, D, E]>(pair(a, quadruple(b, c, d, e)), {
    to([v, w, x, y, z]) {
      return [v, [w, x, y, z]];
    },
    from([v, [w, x, y, z]]) {
      return [v, w, x, y, z];
    },
  });
}

function sextuple<A, B, C, D, E, F>(
  a: Codec<A>,
  b: Codec<B>,
  c: Codec<C>,
  d: Codec<D>,
  e: Codec<E>,
  f: Codec<F>
): Codec<[A, B, C, D, E, F]> {
  return relabelled<[A, [B, C, D, E, F]], [A, B, C, D, E, F]>(pair(a, quintuple(b, c, d, e, f)), {
    to([u, v, w, x, y, z]) {
      return [u, [v, w, x, y, z]];
    },
    from([u, [v, w, x, y, z]]) {
      return [u, v, w, x, y, z];
    },
  });
}

export function tuple<A, B>(a: Codec<A>, b: Codec<B>): Codec<[A, B]>;
export function tuple<A, B, C>(a: Codec<A>, b: Codec<B>, c: Codec<C>): Codec<[A, B, C]>;
export function tuple<A, B, C, D>(
  a: Codec<A>,
  b: Codec<B>,
  c: Codec<C>,
  d: Codec<D>
): Codec<[A, B, C, D]>;
export function tuple<A, B, C, D, E>(
  a: Codec<A>,
  b: Codec<B>,
  c: Codec<C>,
  d: Codec<D>,
  e: Codec<E>
): Codec<[A, B, C, D, E]>;
export function tuple<A, B, C, D, E, F>(
  a: Codec<A>,
  b: Codec<B>,
  c: Codec<C>,
  d: Codec<D>,
  e: Codec<E>,
  f: Codec<F>
): Codec<[A, B, C, D, E, F]>;
export function tuple(
  a: Codec<unknown>,
  b: Codec<unknown>,
  c?: Codec<unknown>,
  d?: Codec<unknown>,
  e?: Codec<unknown>,
  f?: Codec<unknown>
): Codec<unknown[]> {
  if (c === undefined) return pair(a, b);
  if (d === undefined) return triple(a, b, c);
  if (e === undefined) return quadruple(a, b, c, d);
  if (f === undefined) return quintuple(a, b, c, d, e);
  return sextuple(a, b, c, d, e, f);
}

class MessageCodec<T, R> {
  readonly shape: Shape;
  readonly tail: Tail;
  private readonly head: Codec<T>;
  private readonly rest: Conversions<R>;

  constructor(head: Codec<T>, tail: Tail, rest: Conversions<R>) {
    this.shape = head.shape;
    this.tail = tail;
    this.head = head;
    this.rest = rest;
  }

  restToValue(rest: R): Value {
    return this.rest.toValue(rest);
  }

  encode(input: T, rest: R): Uint8Array {
    return concatBytes(
      encodeValue(this.shape, this.head.toValue(input)),
      encodeTail(this.tail, this.rest.toValue(rest))
    );
  }

  decode(bytes: Uint8Array): [T, R] {
    if (!isByteArray(bytes)) throw new TypeError('Bytes must be a Uint8Array.');
    const read = readValue(this.shape, bytes, 0);
    const rest = decodeTail(this.tail, bytes.slice(read.offset));
    return [this.head.fromValue(read.value), this.rest.fromValue(rest)];
  }
}

export type { MessageCodec };

export function thenRestAsBytes<T>(head: Codec<T>): MessageCodec<T, Uint8Array> {
  return new MessageCodec(head, 'bytes', bytesConversions);
}

export function thenRestAsText<T>(head: Codec<T>): MessageCodec<T, string> {
  return new MessageCodec(head, 'text', textConversions);
}
