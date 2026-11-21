import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import {
  type Codec,
  type IntCodec,
  type MessageCodec,
  bytes,
  compactSize,
  constant,
  fixedBytes,
  list,
  text,
  thenRestAsBytes,
  thenRestAsText,
  tuple,
  uint,
} from './codec';

type Value = ReturnType<Codec<unknown>['toValue']>;

interface Sample {
  codec: Codec<unknown>;
  values: fc.Arbitrary<unknown>;
}

interface Case {
  codec: Codec<unknown>;
  value: unknown;
}

interface Mutation {
  kind: 'none' | 'truncate' | 'append' | 'replace' | 'random';
  position: number;
  byte: number;
  random: Uint8Array;
}
const twoToThe16 = 2 ** 16;
const twoToThe32 = 2 ** 32;
const twoToThe48 = 2 ** 48;
const twoToThe64 = 2 ** 64;
const u32be = uint(4, 'big');
const u64be = uint(8, 'big');

function hexOrDash(value: Uint8Array): string {
  return value.length === 0 ? '-' : bytesToHex(value);
}

function codePointsOrDash(value: string): string {
  if (value === '') return '-';
  return Array.from(value, character => (character.codePointAt(0) ?? 0).toString(16)).join(',');
}

function describeValue(value: Value): string[] {
  if (value.kind === 'int') return [BigInt(value.value).toString()];
  if (value.kind === 'bytes') return [hexOrDash(value.value)];
  if (value.kind === 'text') return [codePointsOrDash(value.value)];
  if (value.kind === 'unit') return [];
  if (value.kind === 'list')
    return [String(value.items.length), ...value.items.flatMap(describeValue)];
  return [...describeValue(value.first), ...describeValue(value.second)];
}

const intCodecArbitrary: fc.Arbitrary<IntCodec> = fc.oneof(
  fc.constant(compactSize),
  fc
    .tuple(fc.integer({ min: 1, max: 8 }), fc.constantFrom<'big' | 'little'>('big', 'little'))
    .map(([width, endian]) => uint(width, endian))
);

const intArbitrary = fc.oneof(
  fc.maxSafeNat(),
  fc.nat({ max: 300 }),
  fc.constantFrom(
    0,
    252,
    253,
    255,
    256,
    twoToThe16 - 1,
    twoToThe16,
    twoToThe32 - 1,
    twoToThe32,
    twoToThe48 - 1,
    twoToThe48,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER + 1,
    twoToThe64
  )
);

const textArbitrary = fc.oneof(
  fc.string({ unit: 'binary', maxLength: 8 }),
  fc.string({ maxLength: 8 }),
  fc.string({ unit: 'binary', minLength: 80, maxLength: 120 }),
  fc.constantFrom('', 'a', '﻿bom', 'адрес-🔐-多重署名')
);

function leafArbitrary(minimumLength: 0 | 1): fc.Arbitrary<Sample> {
  return fc.oneof(
    intCodecArbitrary.map(codec => ({ codec, values: intArbitrary })),
    fc.integer({ min: minimumLength, max: 8 }).map(length => ({
      codec: fixedBytes(length),
      values: fc.oneof(
        fc.uint8Array({ minLength: length, maxLength: length }),
        fc.uint8Array({ maxLength: 10 })
      ),
    })),
    intCodecArbitrary.map(length => ({
      codec: bytes(length),
      values: fc.oneof(fc.uint8Array({ maxLength: 8 }), fc.uint8Array({ maxLength: 300 })),
    })),
    intCodecArbitrary.map(length => ({ codec: text(length), values: textArbitrary })),
    fc.uint8Array({ minLength: minimumLength, maxLength: 4 }).map(tag => ({
      codec: constant(tag),
      values: fc.constant(undefined),
    }))
  );
}

function sampleArbitrary(depth: number, minimumLength: 0 | 1): fc.Arbitrary<Sample> {
  const leaf = leafArbitrary(minimumLength);
  if (depth === 0) return leaf;
  const inner = sampleArbitrary(depth - 1, minimumLength);
  const listItem = sampleArbitrary(depth - 1, 1);
  return fc.oneof(
    leaf,
    fc.tuple(intCodecArbitrary, listItem).map(([count, item]) => ({
      codec: list(count, item.codec),
      values: fc.array(item.values, { maxLength: 4 }),
    })),
    fc.tuple(inner, inner).map(([a, b]) => ({
      codec: tuple(a.codec, b.codec),
      values: fc.tuple(a.values, b.values),
    })),
    fc.tuple(inner, inner, inner).map(([a, b, c]) => ({
      codec: tuple(a.codec, b.codec, c.codec),
      values: fc.tuple(a.values, b.values, c.values),
    })),
    fc.tuple(inner, inner, inner, inner).map(([a, b, c, d]) => ({
      codec: tuple(a.codec, b.codec, c.codec, d.codec),
      values: fc.tuple(a.values, b.values, c.values, d.values),
    })),
    fc.tuple(leaf, leaf, leaf, leaf, leaf).map(([a, b, c, d, e]) => ({
      codec: tuple(a.codec, b.codec, c.codec, d.codec, e.codec),
      values: fc.tuple(a.values, b.values, c.values, d.values, e.values),
    })),
    fc.tuple(leaf, leaf, leaf, leaf, leaf, leaf).map(([a, b, c, d, e, f]) => ({
      codec: tuple(a.codec, b.codec, c.codec, d.codec, e.codec, f.codec),
      values: fc.tuple(a.values, b.values, c.values, d.values, e.values, f.values),
    }))
  );
}

const sampleDepth = 2;

const caseArbitrary: fc.Arbitrary<Case> = sampleArbitrary(sampleDepth, 0).chain(sample =>
  sample.values.map(value => ({ codec: sample.codec, value }))
);

const mutationArbitrary: fc.Arbitrary<Mutation> = fc.record({
  kind: fc.constantFrom<Mutation['kind']>('none', 'truncate', 'append', 'replace', 'random'),
  position: fc.nat(),
  byte: fc.integer({ min: 0, max: 255 }),
  random: fc.uint8Array({ maxLength: 24 }),
});

function mutate(encoded: Uint8Array, { kind, position, byte, random }: Mutation): Uint8Array {
  if (kind === 'none') return encoded;
  if (kind === 'random' || encoded.length === 0) return random;
  if (kind === 'truncate') return encoded.slice(0, position % encoded.length);
  if (kind === 'append') return Uint8Array.from([...encoded, byte]);
  const replaced = encoded.slice();
  replaced[position % encoded.length] = byte;
  return replaced;
}

function candidateEncoding({ codec, value }: Case, mutation: Mutation): Uint8Array {
  try {
    return mutate(codec.encode(value), mutation);
  } catch {
    return mutation.random;
  }
}

interface MessageCase {
  head: Codec<unknown>;
  message: MessageCodec<unknown, unknown>;
  value: unknown;
  rest: unknown;
}

const messageCaseArbitrary: fc.Arbitrary<MessageCase> = sampleArbitrary(1, 0).chain(sample =>
  fc.oneof(
    fc.tuple(sample.values, fc.uint8Array({ maxLength: 12 })).map(([value, rest]) => ({
      head: sample.codec,
      message: thenRestAsBytes(sample.codec),
      value,
      rest,
    })),
    fc.tuple(sample.values, textArbitrary).map(([value, rest]) => ({
      head: sample.codec,
      message: thenRestAsText(sample.codec),
      value,
      rest,
    }))
  )
);

interface Enumerated {
  codec: Codec<unknown>;
  values: unknown[];
  takesBytes: boolean;
}

const smallIntCodecs = [uint(1, 'big'), uint(2, 'little'), compactSize];
const smallInts = [0, 1, 252, 253, 255, 256, twoToThe16 - 1, twoToThe16, Number.MAX_SAFE_INTEGER];
const smallByteStrings = [
  new Uint8Array(0),
  Uint8Array.of(0),
  Uint8Array.of(1, 2),
  new Uint8Array(253),
];
const smallTexts = ['', 'a', 'é', '🔐'];
const valuesPerPairSide = 3;
const decodeAlphabet = [0x00, 0x01, 0xfd, 0xff];
const decodeMaxLength = 3;

const enumeratedLeaves: Enumerated[] = [
  ...smallIntCodecs.map(codec => ({
    codec,
    values: [...smallInts, Number.MAX_SAFE_INTEGER + 1],
    takesBytes: true,
  })),
  { codec: fixedBytes(0), values: [new Uint8Array(0), Uint8Array.of(0)], takesBytes: false },
  { codec: fixedBytes(2), values: smallByteStrings, takesBytes: true },
  ...smallIntCodecs.map(length => ({
    codec: bytes(length),
    values: smallByteStrings,
    takesBytes: true,
  })),
  ...smallIntCodecs.map(length => ({ codec: text(length), values: smallTexts, takesBytes: true })),
  { codec: constant(new Uint8Array(0)), values: [undefined], takesBytes: false },
  { codec: constant(Uint8Array.of(0xfd)), values: [undefined], takesBytes: true },
];

const enumeratedShapes: Enumerated[] = [
  ...enumeratedLeaves,
  ...smallIntCodecs.flatMap(count =>
    enumeratedLeaves
      .filter(leaf => leaf.takesBytes)
      .map(leaf => ({
        codec: list(count, leaf.codec),
        values: [[], leaf.values.slice(0, 1), leaf.values.slice(0, 2)],
        takesBytes: true,
      }))
  ),
  ...enumeratedLeaves.flatMap(first =>
    enumeratedLeaves.map(second => ({
      codec: tuple(first.codec, second.codec),
      values: first.values
        .slice(0, valuesPerPairSide)
        .flatMap(left => second.values.slice(0, valuesPerPairSide).map(right => [left, right])),
      takesBytes: true,
    }))
  ),
];

function byteStringsUpTo(length: number): Uint8Array[] {
  if (length === 0) return [new Uint8Array(0)];
  const shorter = byteStringsUpTo(length - 1);
  const longest = shorter.filter(candidate => candidate.length === length - 1);
  return [
    ...shorter,
    ...longest.flatMap(prefix => decodeAlphabet.map(byte => Uint8Array.from([...prefix, byte]))),
  ];
}

const proposalLikeCodec = tuple(text(u32be), text(u32be), bytes(u32be), u64be);
const witnessStackCodec = list(compactSize, bytes(compactSize));

describe('codec kernel', () => {
  test('writes integers in the width and byte order of their codec', () => {
    expect(bytesToHex(uint(1, 'big').encode(255))).toBe('ff');
    expect(bytesToHex(uint(2, 'big').encode(0x0102))).toBe('0102');
    expect(bytesToHex(uint(2, 'little').encode(0x0102))).toBe('0201');
    expect(bytesToHex(u32be.encode(1))).toBe('00000001');
    expect(bytesToHex(uint(4, 'little').encode(1))).toBe('01000000');
    expect(bytesToHex(u64be.encode(Number.MAX_SAFE_INTEGER))).toBe('001fffffffffffff');
    expect(bytesToHex(uint(8, 'little').encode(Number.MAX_SAFE_INTEGER))).toBe('ffffffffffff1f00');
  });

  test.each([
    [0, '00'],
    [252, 'fc'],
    [253, 'fdfd00'],
    [twoToThe16 - 1, 'fdffff'],
    [twoToThe16, 'fe00000100'],
    [twoToThe32 - 1, 'feffffffff'],
    [twoToThe32, 'ff0000000001000000'],
    [Number.MAX_SAFE_INTEGER, 'ffffffffffffff1f00'],
  ])('writes %d as the compact size %s and reads it back', (value, encoded) => {
    expect(bytesToHex(compactSize.encode(value))).toBe(encoded);
    expect(compactSize.decode(hexToBytes(encoded))).toBe(value);
  });

  test('writes the parts of a tuple one after another', () => {
    const encoded = proposalLikeCodec.encode(['a', '🔐', Uint8Array.of(0xff, 0x00), 1]);
    expect(bytesToHex(encoded)).toBe(
      '00000001' + '61' + '00000004' + 'f09f9490' + '00000002' + 'ff00' + '0000000000000001'
    );
    expect(proposalLikeCodec.decode(encoded)).toEqual(['a', '🔐', Uint8Array.of(0xff, 0x00), 1]);
  });

  test('keeps the order of up to six parts', () => {
    const byte = uint(1, 'big');
    const five = tuple(byte, byte, byte, byte, byte);
    const six = tuple(byte, byte, byte, byte, byte, byte);
    expect(bytesToHex(five.encode([1, 2, 3, 4, 5]))).toBe('0102030405');
    expect(five.decode(hexToBytes('0102030405'))).toEqual([1, 2, 3, 4, 5]);
    expect(bytesToHex(six.encode([1, 2, 3, 4, 5, 6]))).toBe('010203040506');
    expect(six.decode(hexToBytes('010203040506'))).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('writes a list as its count and then each item', () => {
    const items = [Uint8Array.of(0x30, 0x44), new Uint8Array(0), Uint8Array.of(0x02)];
    expect(bytesToHex(witnessStackCodec.encode(items))).toBe('03' + '023044' + '00' + '0102');
    expect(witnessStackCodec.decode(hexToBytes('0302304400' + '0102'))).toEqual(items);
  });

  test('writes a constant with no value and reads back only those bytes', () => {
    const tagged = tuple(constant(Uint8Array.of(0xca, 0xfe)), uint(1, 'big'));
    expect(bytesToHex(tagged.encode([undefined, 7]))).toBe('cafe07');
    expect(tagged.decode(hexToBytes('cafe07'))).toEqual([undefined, 7]);
    expect(() => tagged.decode(hexToBytes('cafd07'))).toThrowError(RangeError);
  });

  test.each([
    ['2^64 would wrap to 0', twoToThe64],
    ['-1 would wrap to 2^64 - 1', -1],
    ['2^53 is not exactly representable by every party', Number.MAX_SAFE_INTEGER + 1],
    ['fractions', 1.5],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
  ])('rejects integer: %s', (_label, value) => {
    const expected = new RangeError(
      'Integer must be a non-negative safe integer that fits its codec.'
    );
    expect(() => u64be.encode(value)).toThrowError(expected);
    expect(() => compactSize.encode(value)).toThrowError(expected);
  });

  test('rejects an integer too large for its width', () => {
    expect(() => uint(1, 'big').encode(256)).toThrowError(RangeError);
    expect(() => u32be.encode(twoToThe32)).toThrowError(RangeError);
    expect(() => uint(6, 'little').encode(twoToThe48)).toThrowError(RangeError);
  });

  test('rejects text with a lone surrogate, which UTF-8 would collapse into U+FFFD', () => {
    expect(() => text(u32be).encode('\ud800')).toThrowError(
      new TypeError('Text must not contain lone surrogates.')
    );
    expect(() => text(u32be).encode('a\udfffb')).toThrowError(TypeError);
    expect(bytesToHex(text(u32be).encode('🔐'))).toBe('00000004f09f9490');
  });

  test('rejects a length that does not fit its prefix', () => {
    const oversized = Object.defineProperty(new Uint8Array(1), 'length', { value: twoToThe32 });
    expect(() => bytes(u32be).encode(oversized)).toThrowError(RangeError);
    expect(() => bytes(uint(1, 'big')).encode(new Uint8Array(256))).toThrowError(RangeError);
    expect(() => text(uint(1, 'big')).encode('a'.repeat(256))).toThrowError(RangeError);
  });

  test('rejects bytes of the wrong fixed length', () => {
    expect(() => fixedBytes(2).encode(Uint8Array.of(1))).toThrowError(
      new RangeError('Bytes must have the fixed length of their codec.')
    );
  });

  test.each([
    ['a number that had a shorter one-byte form', 'fdfc00'],
    ['a number that had a shorter three-byte form', 'feffff0000'],
    ['a number that had a shorter five-byte form', 'ffffffffff00000000'],
    ['a number above the largest safe integer', 'ffffffffffffffffff'],
    ['a cut-off body', 'fdfd'],
    ['no bytes', ''],
  ])('rejects a compact size holding %s', (_label, encoded) => {
    expect(() => compactSize.decode(hexToBytes(encoded))).toThrowError(
      new RangeError('Bytes are not a valid encoding for this codec.')
    );
  });

  test.each([
    ['an overlong form', '02c080'],
    ['an encoded surrogate', '03eda080'],
    ['a cut-off character', '02f09f'],
  ])('rejects text holding %s', (_label, encoded) => {
    expect(() => text(uint(1, 'big')).decode(hexToBytes(encoded))).toThrowError(RangeError);
  });

  test('keeps a leading byte order mark as part of the text', () => {
    expect(text(uint(1, 'big')).decode(hexToBytes('03efbbbf'))).toBe('﻿');
  });

  test('rejects bytes left over after the value, and bytes that stop short', () => {
    expect(() => u32be.decode(hexToBytes('0000000100'))).toThrowError(RangeError);
    expect(() => u32be.decode(hexToBytes('000000'))).toThrowError(RangeError);
    expect(() => witnessStackCodec.decode(hexToBytes('0201aa'))).toThrowError(RangeError);
  });

  test('refuses to build codecs outside what the model covers', () => {
    expect(() => uint(0, 'big')).toThrowError(RangeError);
    expect(() => uint(9, 'big')).toThrowError(RangeError);
    expect(() => uint(1.5, 'big')).toThrowError(RangeError);
    expect(() => fixedBytes(-1)).toThrowError(RangeError);
    expect(() => list(compactSize, fixedBytes(0))).toThrowError(
      new RangeError('List items must take at least one byte.')
    );
    expect(() => list(compactSize, tuple(constant(new Uint8Array(0)), fixedBytes(0)))).toThrowError(
      RangeError
    );
  });

  test('does not let a caller change a constant after the codec is built', () => {
    const tag = Uint8Array.of(1, 2);
    const codec = constant(tag);
    tag[0] = 9;
    expect(bytesToHex(codec.encode(undefined))).toBe('0102');
  });
});

describe('message ending with the rest of the bytes', () => {
  const tagged = thenRestAsBytes(constant(Uint8Array.of(0xca, 0xfe)));
  const greeting = thenRestAsText(uint(1, 'big'));

  test('writes the head and then the rest with no length in front', () => {
    expect(bytesToHex(tagged.encode(undefined, Uint8Array.of(1, 2, 3)))).toBe('cafe010203');
    expect(bytesToHex(greeting.encode(7, 'hi'))).toBe('076869');
    expect(bytesToHex(tagged.encode(undefined, new Uint8Array(0)))).toBe('cafe');
  });

  test('reads the head and gives back everything after it', () => {
    expect(tagged.decode(hexToBytes('cafe010203'))).toEqual([undefined, Uint8Array.of(1, 2, 3)]);
    expect(greeting.decode(hexToBytes('076869'))).toEqual([7, 'hi']);
    expect(tagged.decode(hexToBytes('cafe'))).toEqual([undefined, new Uint8Array(0)]);
  });

  test('rejects a wrong head, a rest that is not UTF-8, and text with a lone surrogate', () => {
    expect(() => tagged.decode(hexToBytes('cafd01'))).toThrowError(RangeError);
    expect(() => greeting.decode(hexToBytes('07c080'))).toThrowError(RangeError);
    expect(() => greeting.encode(7, '\ud800')).toThrowError(TypeError);
  });
});

const propertyRuns = 3200;
const structuralRuns = propertyRuns / 2;

function tryEncode(codec: Codec<unknown>, value: unknown): Uint8Array | undefined {
  try {
    return codec.encode(value);
  } catch {
    return undefined;
  }
}

function tryDecode(codec: Codec<unknown>, encoded: Uint8Array): { value: unknown } | undefined {
  try {
    return { value: codec.decode(encoded) };
  } catch {
    return undefined;
  }
}

function shown(codec: Codec<unknown>, value: unknown): string {
  return describeValue(codec.toValue(value)).join(' ');
}

function hexOfEncoding(encoded: Uint8Array | undefined): string | undefined {
  return encoded === undefined ? undefined : bytesToHex(encoded);
}

function hexOfParts(parts: (Uint8Array | undefined)[]): string | undefined {
  const present = parts.flatMap(part => (part === undefined ? [] : [bytesToHex(part)]));
  return present.length === parts.length ? present.join('') : undefined;
}

function checkRoundTrip(codec: Codec<unknown>, value: unknown) {
  const encoded = tryEncode(codec, value);
  if (!encoded) return;
  const back = tryDecode(codec, encoded);
  expect(back && shown(codec, back.value)).toBe(shown(codec, value));
}

function checkCanonical(codec: Codec<unknown>, candidate: Uint8Array) {
  const back = tryDecode(codec, candidate);
  if (!back) return;
  expect(hexOfEncoding(tryEncode(codec, back.value))).toBe(bytesToHex(candidate));
}

function checkPrefixFree(codec: Codec<unknown>, value: unknown, extra: number) {
  const encoded = tryEncode(codec, value);
  if (!encoded) return;
  expect(tryDecode(codec, Uint8Array.from([...encoded, extra]))).toBeUndefined();
  if (encoded.length > 0) expect(tryDecode(codec, encoded.slice(0, -1))).toBeUndefined();
}

function tupleOf(codecs: Codec<unknown>[]): Codec<unknown> | undefined {
  const [a, b, c, d, e, f] = codecs;
  if (a === undefined || b === undefined) return undefined;
  if (c === undefined) return tuple(a, b);
  if (d === undefined) return tuple(a, b, c);
  if (e === undefined) return tuple(a, b, c, d);
  if (f === undefined) return tuple(a, b, c, d, e);
  return tuple(a, b, c, d, e, f);
}

function isWellFormedText(value: string): boolean {
  return (
    new TextDecoder('utf-8', { ignoreBOM: true }).decode(new TextEncoder().encode(value)) === value
  );
}

function strictUtf8(body: Uint8Array): string | undefined {
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(body);
  } catch {
    return undefined;
  }
}

function restBytes(rest: unknown): Uint8Array | undefined {
  if (rest instanceof Uint8Array) return rest;
  if (typeof rest === 'string' && isWellFormedText(rest)) return new TextEncoder().encode(rest);
  return undefined;
}

function tryEncodeMessage(
  message: MessageCodec<unknown, unknown>,
  value: unknown,
  rest: unknown
): Uint8Array | undefined {
  try {
    return message.encode(value, rest);
  } catch {
    return undefined;
  }
}

function bigEndianValue(encoded: Uint8Array): bigint {
  return encoded.reduce((value, byte) => (value << 8n) | BigInt(byte), 0n);
}

function littleEndianBytes(value: number, width: number): number[] {
  return Array.from({ length: width }, (_, index) =>
    Number((BigInt(value) >> BigInt(8 * index)) & 0xffn)
  );
}

const compactForms = [
  { tag: undefined, width: 0, below: 253 },
  { tag: 253, width: 2, below: twoToThe16 },
  { tag: 254, width: 4, below: twoToThe32 },
  { tag: 255, width: 8, below: Number.POSITIVE_INFINITY },
];

const samplePairArbitrary = sampleArbitrary(sampleDepth, 0).chain(sample =>
  fc.tuple(sample.values, sample.values).map(([left, right]) => ({
    codec: sample.codec,
    left,
    right,
  }))
);

const smallCaseArbitrary: fc.Arbitrary<Case> = sampleArbitrary(1, 0).chain(sample =>
  sample.values.map(value => ({ codec: sample.codec, value }))
);

const itemsArbitrary = sampleArbitrary(1, 1).chain(sample =>
  fc.array(sample.values, { maxLength: 5 }).map(values => ({ item: sample.codec, values }))
);

const anyNumberArbitrary = fc.oneof(
  intArbitrary,
  fc.constantFrom(-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY)
);

const loneSurrogateTextArbitrary = fc
  .tuple(
    fc.string({ maxLength: 4 }),
    fc.integer({ min: 0xd800, max: 0xdfff }),
    fc.constantFrom('', 'a')
  )
  .map(([before, unit, after]) => before + String.fromCharCode(unit) + after)
  .filter(value => !isWellFormedText(value));

describe('codec kernel properties', () => {
  test('small cases: decoding what was encoded gives the value back', () => {
    for (const { codec, values } of enumeratedShapes) {
      for (const value of values) checkRoundTrip(codec, value);
    }
  });

  test('small cases: decoding accepts only what encoding writes', () => {
    const candidates = byteStringsUpTo(decodeMaxLength);
    for (const { codec } of enumeratedShapes) {
      for (const candidate of candidates) checkCanonical(codec, candidate);
    }
  });

  test('small cases: no encoding is a prefix of another or takes extra bytes', () => {
    for (const { codec, values } of enumeratedShapes) {
      for (const value of values) checkPrefixFree(codec, value, 0);
    }
  });

  test('decoding what was encoded gives the value back', () => {
    fc.assert(
      fc.property(caseArbitrary, ({ codec, value }) => checkRoundTrip(codec, value)),
      { numRuns: propertyRuns, endOnFailure: true }
    );
  });

  test('decoding accepts only what encoding writes', () => {
    fc.assert(
      fc.property(caseArbitrary, mutationArbitrary, (sample, mutation) =>
        checkCanonical(sample.codec, candidateEncoding(sample, mutation))
      ),
      { numRuns: propertyRuns, endOnFailure: true }
    );
  });

  test('two values share an encoding only when they are equal', () => {
    fc.assert(
      fc.property(samplePairArbitrary, ({ codec, left, right }) => {
        const a = tryEncode(codec, left);
        const b = tryEncode(codec, right);
        if (!a || !b) return;
        expect(bytesToHex(a) === bytesToHex(b)).toBe(shown(codec, left) === shown(codec, right));
      }),
      { numRuns: propertyRuns, endOnFailure: true }
    );
  });

  test('no encoding is a prefix of another or takes extra bytes', () => {
    fc.assert(
      fc.property(caseArbitrary, fc.integer({ min: 0, max: 255 }), ({ codec, value }, extra) =>
        checkPrefixFree(codec, value, extra)
      ),
      { numRuns: propertyRuns, endOnFailure: true }
    );
  });

  test('a tuple is its parts one after another, in order', () => {
    fc.assert(
      fc.property(fc.array(smallCaseArbitrary, { minLength: 2, maxLength: 6 }), parts => {
        const whole = tupleOf(parts.map(({ codec }) => codec));
        if (!whole) throw new Error('A tuple needs at least two parts.');
        const values = parts.map(({ value }) => value);
        const encoded = tryEncode(whole, values);
        expect(hexOfEncoding(encoded)).toBe(
          hexOfParts(parts.map(({ codec, value }) => tryEncode(codec, value)))
        );
        if (!encoded) return;
        const back = tryDecode(whole, encoded);
        const backValues = back && Array.isArray(back.value) ? back.value : [];
        expect(backValues.length).toBe(parts.length);
        parts.forEach(({ codec, value }, index) =>
          expect(shown(codec, backValues[index])).toBe(shown(codec, value))
        );
      }),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('a list is its count and then each item', () => {
    fc.assert(
      fc.property(intCodecArbitrary, itemsArbitrary, (count, { item, values }) => {
        expect(hexOfEncoding(tryEncode(list(count, item), values))).toBe(
          hexOfParts([
            tryEncode(count, values.length),
            ...values.map(value => tryEncode(item, value)),
          ])
        );
      }),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('bytes and text are their byte length and then the bytes', () => {
    fc.assert(
      fc.property(
        intCodecArbitrary,
        fc.uint8Array({ maxLength: 300 }),
        textArbitrary,
        (length, body, words) => {
          expect(hexOfEncoding(tryEncode(bytes(length), body))).toBe(
            hexOfParts([tryEncode(length, body.length), body])
          );
          const utf8 = new TextEncoder().encode(words);
          expect(hexOfEncoding(tryEncode(text(length), words))).toBe(
            hexOfParts([tryEncode(length, utf8.length), utf8])
          );
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('fixed bytes and constants are written as they are', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 12 }), fc.nat({ max: 12 }), (body, length) => {
        expect(hexOfEncoding(tryEncode(fixedBytes(length), body))).toBe(
          body.length === length ? bytesToHex(body) : undefined
        );
        expect(bytesToHex(constant(body).encode(undefined))).toBe(bytesToHex(body));
        expect(tryDecode(constant(body), body)).toBeDefined();
        if (body.length === 0) return;
        const other = body.map((byte, index) => (index === 0 ? byte ^ 1 : byte));
        expect(tryDecode(constant(body), other)).toBeUndefined();
      }),
      { numRuns: structuralRuns / 2, endOnFailure: true }
    );
  });

  test('an integer has its width, its value and its byte order, and is refused outside its range', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 8 }), anyNumberArbitrary, (width, n) => {
        const big = tryEncode(uint(width, 'big'), n);
        const little = tryEncode(uint(width, 'little'), n);
        const fits = Number.isSafeInteger(n) && n >= 0 && BigInt(n) < 1n << BigInt(8 * width);
        expect(big !== undefined).toBe(fits);
        expect(little !== undefined).toBe(fits);
        if (!big || !little) return;
        expect(big.length).toBe(width);
        expect(bigEndianValue(big)).toBe(BigInt(n));
        expect(bytesToHex(little)).toBe(bytesToHex(Uint8Array.from(big).reverse()));
      }),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('an integer is read from exactly its width and refused above the largest safe integer', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        fc.uint8Array({ maxLength: 9 }),
        (width, encoded) => {
          const back = tryDecode(uint(width, 'big'), encoded);
          const value = bigEndianValue(encoded);
          const valid = encoded.length === width && value <= BigInt(Number.MAX_SAFE_INTEGER);
          expect(back?.value).toBe(valid ? Number(value) : undefined);
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('a compact size uses the shortest of its four forms and refuses the others', () => {
    fc.assert(
      fc.property(anyNumberArbitrary, n => {
        const encoded = tryEncode(compactSize, n);
        const valid = Number.isSafeInteger(n) && n >= 0;
        expect(encoded !== undefined).toBe(valid);
        if (!encoded) return;
        const shortest = compactForms.findIndex(form => n < form.below);
        compactForms.forEach(({ tag, width }, index) => {
          const form = tag === undefined ? [n] : [tag, ...littleEndianBytes(n, width)];
          if (index === shortest)
            expect(bytesToHex(encoded)).toBe(bytesToHex(Uint8Array.from(form)));
          if (index > shortest)
            expect(tryDecode(compactSize, Uint8Array.from(form))).toBeUndefined();
        });
      }),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('text is refused with a lone surrogate, and read only from valid UTF-8', () => {
    fc.assert(
      fc.property(loneSurrogateTextArbitrary, fc.uint8Array({ maxLength: 8 }), (broken, body) => {
        expect(tryEncode(text(uint(1, 'big')), broken)).toBeUndefined();
        const encoded = Uint8Array.from([body.length, ...body]);
        expect(tryDecode(text(uint(1, 'big')), encoded)?.value).toBe(strictUtf8(body));
      }),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('constructors refuse what the kernel does not support', () => {
    for (const width of [0, 9, 1.5, -1]) expect(() => uint(width, 'big')).toThrow();
    expect(() => fixedBytes(-1)).toThrow();
    expect(() => fixedBytes(1.5)).toThrow();
    expect(() => list(compactSize, fixedBytes(0))).toThrow();
    expect(() => list(compactSize, constant(new Uint8Array(0)))).toThrow();
    expect(() => list(compactSize, tuple(fixedBytes(0), constant(new Uint8Array(0))))).toThrow();
    expect(() => list(compactSize, fixedBytes(1))).not.toThrow();
  });

  test('a message is its head and then the rest, and reads back', () => {
    fc.assert(
      fc.property(messageCaseArbitrary, ({ message, head, value, rest }) => {
        const encoded = tryEncodeMessage(message, value, rest);
        expect(hexOfEncoding(encoded)).toBe(hexOfParts([tryEncode(head, value), restBytes(rest)]));
        if (!encoded) return;
        const [backValue, backRest] = message.decode(encoded);
        expect(shown(head, backValue)).toBe(shown(head, value));
        expect(describeValue(message.restToValue(backRest)).join(' ')).toBe(
          describeValue(message.restToValue(rest)).join(' ')
        );
      }),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });
});
