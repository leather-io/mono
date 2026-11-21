import { CompactSizeLen } from '@scure/btc-signer/script';
import * as P from 'micro-packed';

type Endian = 'big' | 'little';

interface Coder<T> {
  encode(value: T): Uint8Array;
  decode(bytes: Uint8Array): T;
  encodeStream(writer: P.Writer, value: T): void;
  decodeStream(reader: P.Reader): T;
}

const maxUintWidth = 8;
const compactSizeMinimumSize = 1;
const firstSurrogate = 0xd800;
const lastSurrogate = 0xdfff;

function isLoneSurrogate(character: string): boolean {
  const codePoint = character.codePointAt(0);
  return codePoint !== undefined && codePoint >= firstSurrogate && codePoint <= lastSurrogate;
}

const strictUtf8: P.Coder<Uint8Array, string> = {
  encode(bytes) {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  },
  decode(text) {
    if (typeof text !== 'string') throw new TypeError('Text must be a string.');
    if (Array.from(text).some(isLoneSurrogate))
      throw new RangeError('Text must not contain a lone surrogate.');
    return new TextEncoder().encode(text);
  },
};

function encodeWith<T>(coder: Coder<T>, value: T): Uint8Array {
  try {
    return coder.encode(value);
  } catch (cause) {
    throw new RangeError('Value cannot be encoded by this codec.', { cause });
  }
}

function decodeWith<T>(coder: Coder<T>, bytes: Uint8Array): T {
  try {
    return coder.decode(bytes);
  } catch (cause) {
    throw new RangeError('Bytes are not a valid encoding for this codec.', { cause });
  }
}

class Codec<T> {
  readonly coder: Coder<T>;
  readonly minimumSize: number;

  constructor(coder: Coder<T>, minimumSize: number) {
    this.coder = coder;
    this.minimumSize = minimumSize;
  }

  encode(input: T): Uint8Array {
    return encodeWith(this.coder, input);
  }

  decode(bytes: Uint8Array): T {
    return decodeWith(this.coder, bytes);
  }
}

class IntCodec extends Codec<number> {}

export type { Codec, IntCodec };

export function uint(width: number, endian: Endian): IntCodec {
  if (!Number.isInteger(width) || width < 1 || width > maxUintWidth)
    throw new RangeError('Integer width must be between 1 and 8 bytes.');
  return new IntCodec(P.apply(P.bigint(width, endian === 'little'), P.coders.numberBigint), width);
}

export const compactSize: IntCodec = new IntCodec(CompactSizeLen, compactSizeMinimumSize);

export function fixedBytes(length: number): Codec<Uint8Array> {
  if (!Number.isSafeInteger(length) || length < 0)
    throw new RangeError('Fixed length must be a non-negative safe integer.');
  return new Codec(P.bytes(length), length);
}

export function bytes(length: IntCodec): Codec<Uint8Array> {
  return new Codec(P.bytes(length.coder), length.minimumSize);
}

export function text(length: IntCodec): Codec<string> {
  return new Codec(P.apply(P.bytes(length.coder), strictUtf8), length.minimumSize);
}

export function constant(value: Uint8Array): Codec<undefined> {
  if (!P.utils.isBytes(value)) throw new TypeError('Bytes must be a Uint8Array.');
  return new Codec(P.magicBytes(value.slice()), value.length);
}

export function list<T>(count: IntCodec, item: Codec<T>): Codec<T[]> {
  if (item.minimumSize === 0) throw new RangeError('List items must take at least one byte.');
  return new Codec(P.array(count.coder, item.coder), count.minimumSize);
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
export function tuple(...parts: Codec<unknown>[]): Codec<unknown[]> {
  return new Codec(
    P.tuple(parts.map(part => part.coder)),
    parts.reduce((total, part) => total + part.minimumSize, 0)
  );
}

class MessageCodec<T, R> {
  private readonly coder: Coder<[T, R]>;

  constructor(head: Codec<T>, rest: Coder<R>) {
    this.coder = P.tuple([head.coder, rest]);
  }

  encode(input: T, rest: R): Uint8Array {
    return encodeWith(this.coder, [input, rest]);
  }

  decode(bytes: Uint8Array): [T, R] {
    return decodeWith(this.coder, bytes);
  }
}

export type { MessageCodec };

export function thenRestAsBytes<T>(head: Codec<T>): MessageCodec<T, Uint8Array> {
  return new MessageCodec(head, P.bytes(null));
}

export function thenRestAsText<T>(head: Codec<T>): MessageCodec<T, string> {
  return new MessageCodec(head, P.apply(P.bytes(null), strictUtf8));
}
