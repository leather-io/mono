import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import {
  askLeanOracle,
  leanOracleAvailable,
  leanOracleRequired,
  readKernelSource,
  typeScriptKinds,
} from '../lean-oracle';
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

type Shape = Codec<unknown>['shape'];
type Value = ReturnType<Codec<unknown>['toValue']>;
type IntShape = IntCodec['intShape'];

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

const oracleBatchSize = 32;
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

function describeInt(codec: IntShape): string[] {
  if (codec.kind === 'compactSize') return ['compact'];
  return ['uint', String(codec.width), codec.endian === 'big' ? 'be' : 'le'];
}

function describeShape(shape: Shape): string[] {
  if (shape.kind === 'int') return ['int', ...describeInt(shape.codec)];
  if (shape.kind === 'fixedBytes') return ['fixed', String(shape.length)];
  if (shape.kind === 'bytes') return ['bytes', ...describeInt(shape.length)];
  if (shape.kind === 'text') return ['text', ...describeInt(shape.length)];
  if (shape.kind === 'constant') return ['const', hexOrDash(shape.bytes)];
  if (shape.kind === 'list')
    return ['list', ...describeInt(shape.count), ...describeShape(shape.item)];
  return ['pair', ...describeShape(shape.first), ...describeShape(shape.second)];
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

function encodeCall({ codec, value }: Case): string {
  return ['encode', ...describeShape(codec.shape), ...describeValue(codec.toValue(value))].join(
    ' '
  );
}

function decodeCall(codec: Codec<unknown>, encoded: Uint8Array): string {
  return ['decode', ...describeShape(codec.shape), hexOrDash(encoded)].join(' ');
}

function observeEncode({ codec, value }: Case): string {
  try {
    return `ok ${hexOrDash(codec.encode(value))}`;
  } catch {
    return 'throws';
  }
}

function observeDecode(codec: Codec<unknown>, encoded: Uint8Array): string {
  try {
    return ['ok', ...describeValue(codec.toValue(codec.decode(encoded)))].join(' ');
  } catch {
    return 'throws';
  }
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

const casePairArbitrary = sampleArbitrary(sampleDepth, 0).chain(sample =>
  fc.tuple(sample.values, sample.values).map(([left, right]) => ({
    codec: sample.codec,
    left,
    right,
  }))
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

function encodeTailCall({ message, value, rest }: MessageCase, head: Codec<unknown>): string {
  return [
    'encodetail',
    message.tail,
    ...describeShape(message.shape),
    ...describeValue(head.toValue(value)),
    ...describeValue(message.restToValue(rest)),
  ].join(' ');
}

function observeEncodeTail({ message, value, rest }: MessageCase): string {
  try {
    return `ok ${hexOrDash(message.encode(value, rest))}`;
  } catch {
    return 'throws';
  }
}

function decodeTailCall(message: MessageCodec<unknown, unknown>, encoded: Uint8Array): string {
  return ['decodetail', message.tail, ...describeShape(message.shape), hexOrDash(encoded)].join(
    ' '
  );
}

function observeDecodeTail(
  message: MessageCodec<unknown, unknown>,
  head: Codec<unknown>,
  encoded: Uint8Array
): string {
  try {
    const [value, rest] = message.decode(encoded);
    return [
      'ok',
      ...describeValue(head.toValue(value)),
      ...describeValue(message.restToValue(rest)),
    ].join(' ');
  } catch {
    return 'throws';
  }
}

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

function shapeKinds(shape: Shape): string[] {
  if (shape.kind === 'list') return [shape.kind, ...shapeKinds(shape.item)];
  if (shape.kind === 'pair')
    return [shape.kind, ...shapeKinds(shape.first), ...shapeKinds(shape.second)];
  return [shape.kind];
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

  test('reads back exactly the value that was written', () => {
    fc.assert(
      fc.property(caseArbitrary, ({ codec, value }) => {
        const observed = observeEncode({ codec, value });
        fc.pre(observed !== 'throws');
        expect(codec.decode(codec.encode(value))).toEqual(value);
      }),
      { numRuns: 500 }
    );
  });

  test('gives two values of one codec the same bytes only when they are equal', () => {
    fc.assert(
      fc.property(casePairArbitrary, ({ codec, left, right }) => {
        const leftBytes = observeEncode({ codec, value: left });
        const rightBytes = observeEncode({ codec, value: right });
        fc.pre(leftBytes !== 'throws' && rightBytes !== 'throws');
        const sameValue =
          describeValue(codec.toValue(left)).join(' ') ===
          describeValue(codec.toValue(right)).join(' ');
        expect(leftBytes === rightBytes).toBe(sameValue);
      }),
      { numRuns: 500 }
    );
  });

  test('accepts only the bytes it would itself write for the value it read', () => {
    fc.assert(
      fc.property(caseArbitrary, mutationArbitrary, (sample, mutation) => {
        const candidate = candidateEncoding(sample, mutation);
        fc.pre(observeDecode(sample.codec, candidate) !== 'throws');
        const reencoded = sample.codec.encode(sample.codec.decode(candidate));
        expect(bytesToHex(reencoded)).toBe(bytesToHex(candidate));
      }),
      { numRuns: 500 }
    );
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

describe('Lean model of the codec kernel', () => {
  test.skipIf(!leanOracleAvailable)(
    'agrees with the kernel on messages that end with the rest of the bytes',
    () => {
      const seen = { accepted: 0, rejected: 0 };
      fc.assert(
        fc.property(
          fc.array(fc.tuple(messageCaseArbitrary, mutationArbitrary), {
            minLength: 1,
            maxLength: oracleBatchSize,
          }),
          cases => {
            const samples = cases.map(([sample, mutation]) => {
              const written = observeEncodeTail(sample);
              const encoded =
                written === 'throws'
                  ? mutation.random
                  : mutate(sample.message.encode(sample.value, sample.rest), mutation);
              return { sample, written, encoded };
            });
            const answers = askLeanOracle(
              samples.flatMap(({ sample, encoded }) => [
                encodeTailCall(sample, sample.head),
                decodeTailCall(sample.message, encoded),
              ])
            );
            samples.forEach(({ sample, written, encoded }, index) => {
              const read = observeDecodeTail(sample.message, sample.head, encoded);
              expect({ sample: encodeTailCall(sample, sample.head), written, read }).toEqual({
                sample: encodeTailCall(sample, sample.head),
                written: answers[index * 2],
                read: answers[index * 2 + 1],
              });
              if (read === 'throws') seen.rejected += 1;
              else seen.accepted += 1;
            });
          }
        ),
        { numRuns: 150, endOnFailure: true }
      );
      expect(seen.accepted).toBeGreaterThan(0);
      expect(seen.rejected).toBeGreaterThan(0);
    }
  );

  test.runIf(leanOracleRequired)('has the Lean oracle built when it is required', () => {
    expect(leanOracleAvailable).toBe(true);
  });

  test.skipIf(!leanOracleAvailable)('agrees with the kernel on fixed encodings', () => {
    const sample = { codec: proposalLikeCodec, value: ['a', '🔐', Uint8Array.of(0xff, 0x00), 1] };
    expect(askLeanOracle([encodeCall(sample)])).toEqual([
      'ok 000000016100000004f09f949000000002ff000000000000000001',
    ]);
    expect(observeEncode(sample)).toBe('ok 000000016100000004f09f949000000002ff000000000000000001');
  });

  test.skipIf(!leanOracleAvailable)(
    'agrees with the kernel on what every generated codec writes',
    () => {
      const seen = { accepted: 0, rejected: 0 };
      fc.assert(
        fc.property(
          fc.array(caseArbitrary, { minLength: 1, maxLength: oracleBatchSize }),
          cases => {
            const answers = askLeanOracle(cases.map(encodeCall));
            expect(answers).toHaveLength(cases.length);
            cases.forEach((sample, index) => {
              const call = encodeCall(sample);
              const typescript = observeEncode(sample);
              expect({ call, typescript }).toEqual({ call, typescript: answers[index] });
              if (typescript === 'throws') seen.rejected += 1;
              else seen.accepted += 1;
            });
          }
        ),
        { numRuns: 200, endOnFailure: true }
      );
      expect(seen.accepted).toBeGreaterThan(0);
      expect(seen.rejected).toBeGreaterThan(0);
    }
  );

  test.skipIf(!leanOracleAvailable)(
    'agrees with the kernel on what every generated codec reads, from valid and damaged bytes',
    () => {
      const seen = { accepted: 0, rejected: 0 };
      fc.assert(
        fc.property(
          fc.array(fc.tuple(caseArbitrary, mutationArbitrary), {
            minLength: 1,
            maxLength: oracleBatchSize,
          }),
          cases => {
            const candidates = cases.map(([sample, mutation]) => ({
              codec: sample.codec,
              encoded: candidateEncoding(sample, mutation),
            }));
            const answers = askLeanOracle(
              candidates.map(({ codec, encoded }) => decodeCall(codec, encoded))
            );
            expect(answers).toHaveLength(candidates.length);
            candidates.forEach(({ codec, encoded }, index) => {
              const call = decodeCall(codec, encoded);
              const typescript = observeDecode(codec, encoded);
              expect({ call, typescript }).toEqual({ call, typescript: answers[index] });
              if (typescript === 'throws') seen.rejected += 1;
              else seen.accepted += 1;
            });
          }
        ),
        { numRuns: 200, endOnFailure: true }
      );
      expect(seen.accepted).toBeGreaterThan(0);
      expect(seen.rejected).toBeGreaterThan(0);
    }
  );

  test.skipIf(!leanOracleAvailable)(
    'agrees with the kernel on every small codec, value and byte string',
    () => {
      const writes = enumeratedShapes.flatMap(({ codec, values }) =>
        values.map(value => ({ codec, value }))
      );
      const candidates = byteStringsUpTo(decodeMaxLength);
      const reads = enumeratedShapes.flatMap(({ codec }) =>
        candidates.map(encoded => ({ codec, encoded }))
      );

      expect(writes.map(observeEncode)).toEqual(askLeanOracle(writes.map(encodeCall)));
      expect(reads.map(({ codec, encoded }) => observeDecode(codec, encoded))).toEqual(
        askLeanOracle(reads.map(({ codec, encoded }) => decodeCall(codec, encoded)))
      );

      const exercised = new Set(enumeratedShapes.flatMap(({ codec }) => shapeKinds(codec.shape)));
      const kernelSource = readKernelSource('./codec/codec.ts');
      expect([...exercised].sort()).toEqual(typeScriptKinds(kernelSource, 'Shape').sort());
    }
  );

  test.skipIf(!leanOracleAvailable)('agrees with the kernel on hand-picked damaged bytes', () => {
    const textCodec = text(uint(1, 'big'));
    const candidates = [
      { codec: compactSize, encoded: hexToBytes('fdfc00') },
      { codec: compactSize, encoded: hexToBytes('fdfd00') },
      { codec: compactSize, encoded: hexToBytes('ffffffffffffffffff') },
      { codec: compactSize, encoded: hexToBytes('ffffffffffffff1f00') },
      { codec: textCodec, encoded: hexToBytes('03efbbbf') },
      { codec: textCodec, encoded: hexToBytes('02c080') },
      { codec: textCodec, encoded: hexToBytes('03eda080') },
      { codec: textCodec, encoded: hexToBytes('04f4908080') },
      { codec: witnessStackCodec, encoded: hexToBytes('0201aa') },
      { codec: witnessStackCodec, encoded: hexToBytes('fe00000001' + '00') },
    ];
    expect(candidates.map(({ codec, encoded }) => observeDecode(codec, encoded))).toEqual(
      askLeanOracle(candidates.map(({ codec, encoded }) => decodeCall(codec, encoded)))
    );
  });
});
