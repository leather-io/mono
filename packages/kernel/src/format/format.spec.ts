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
  type Format,
  characters,
  charactersExcept,
  charactersIn,
  numeral,
  optionalSuffix,
  prefixed,
  separated,
  splitAt,
} from './format';

type Shape = Format<unknown>['shape'];
type Value = ReturnType<Format<unknown>['toValue']>;

type Blueprint =
  | { kind: 'number'; base: number; width: number | undefined }
  | { kind: 'chars'; ranges: string[]; negated: boolean; minLength: number; maxLength: number }
  | { kind: 'prefixed'; text: string; inner: Blueprint }
  | { kind: 'optionalSuffix'; mark: string; inner: Blueprint }
  | { kind: 'separated'; separator: string; minCount: number; item: Blueprint }
  | { kind: 'split'; separator: string; first: Blueprint; second: Blueprint };

interface Sample {
  format: Format<unknown>;
  values: fc.Arbitrary<unknown>;
}

interface Case {
  format: Format<unknown>;
  value: unknown;
}

interface Mutation {
  kind: 'none' | 'drop' | 'insert' | 'replace' | 'random';
  position: number;
  character: string;
  random: string;
}

const oracleBatchSize = 32;
const blueprintDepth = 3;
const delimiters = ['/', "'", ']', ':', ','];
const characterPool = ['0', '1', '7', '9', 'a', 'f', 'g', 'x', 'A', '🔐', ...delimiters, '['];

function codePoint(character: string): string {
  return (character.codePointAt(0) ?? 0).toString(16);
}

function codePointsOrDash(text: string): string {
  return text === '' ? '-' : Array.from(text, codePoint).join(',');
}

function describeRange(range: string): string {
  const [low, high = low] = Array.from(range, character => character.codePointAt(0) ?? 0);
  return `${low}-${high}`;
}

function describeBlueprint(blueprint: Blueprint): string[] {
  if (blueprint.kind === 'number')
    return ['number', String(blueprint.base), String(blueprint.width ?? '-')];
  if (blueprint.kind === 'chars')
    return [
      'chars',
      blueprint.negated ? '1' : '0',
      blueprint.ranges.map(describeRange).join(';') || '-',
      String(blueprint.minLength),
      String(blueprint.maxLength),
    ];
  if (blueprint.kind === 'prefixed')
    return ['prefixed', codePointsOrDash(blueprint.text), ...describeBlueprint(blueprint.inner)];
  if (blueprint.kind === 'optionalSuffix')
    return ['suffix', codePoint(blueprint.mark), ...describeBlueprint(blueprint.inner)];
  if (blueprint.kind === 'separated')
    return [
      'separated',
      codePoint(blueprint.separator),
      String(blueprint.minCount),
      ...describeBlueprint(blueprint.item),
    ];
  return [
    'split',
    codePoint(blueprint.separator),
    ...describeBlueprint(blueprint.first),
    ...describeBlueprint(blueprint.second),
  ];
}

function describeShape(shape: Shape): string[] {
  if (shape.kind === 'number') return ['number', String(shape.base), String(shape.width ?? '-')];
  if (shape.kind === 'chars')
    return [
      'chars',
      shape.set.negated ? '1' : '0',
      shape.set.ranges.map(([low, high]) => `${low}-${high}`).join(';') || '-',
      String(shape.minLength),
      String(shape.maxLength),
    ];
  if (shape.kind === 'prefixed')
    return ['prefixed', codePointsOrDash(shape.text), ...describeShape(shape.inner)];
  if (shape.kind === 'optionalSuffix')
    return ['suffix', codePoint(shape.mark), ...describeShape(shape.inner)];
  if (shape.kind === 'separated')
    return [
      'separated',
      codePoint(shape.separator),
      String(shape.minCount),
      ...describeShape(shape.item),
    ];
  return [
    'split',
    codePoint(shape.separator),
    ...describeShape(shape.first),
    ...describeShape(shape.second),
  ];
}

function describeValue(value: Value): string[] {
  if (value.kind === 'nat') return [BigInt(value.value).toString()];
  if (value.kind === 'text') return [codePointsOrDash(value.value)];
  if (value.kind === 'bool') return [value.value ? '1' : '0'];
  if (value.kind === 'list')
    return [String(value.items.length), ...value.items.flatMap(describeValue)];
  return [...describeValue(value.first), ...describeValue(value.second)];
}

const natArbitrary = fc.oneof(
  fc.maxSafeNat(),
  fc.nat({ max: 300 }),
  fc.constantFrom(0, 9, 10, 15, 16, 255, 256, 2 ** 32 - 1, 2 ** 32, Number.MAX_SAFE_INTEGER),
  fc.constantFrom(Number.MAX_SAFE_INTEGER + 1, 2 ** 64)
);

const poolTextArbitrary = fc
  .array(fc.constantFrom(...characterPool), { maxLength: 10 })
  .map(characters => characters.join(''));

function build(blueprint: Blueprint): Sample {
  if (blueprint.kind === 'number')
    return { format: numeral(blueprint.base, blueprint.width), values: natArbitrary };
  if (blueprint.kind === 'chars') {
    const set = blueprint.negated
      ? charactersExcept(...blueprint.ranges)
      : charactersIn(...blueprint.ranges);
    const { minLength, maxLength } = blueprint;
    return { format: characters(set, { minLength, maxLength }), values: poolTextArbitrary };
  }
  if (blueprint.kind === 'prefixed') {
    const inner = build(blueprint.inner);
    return { format: prefixed(blueprint.text, inner.format), values: inner.values };
  }
  if (blueprint.kind === 'optionalSuffix') {
    const inner = build(blueprint.inner);
    return {
      format: optionalSuffix(blueprint.mark, inner.format),
      values: fc.tuple(inner.values, fc.boolean()),
    };
  }
  if (blueprint.kind === 'separated') {
    const item = build(blueprint.item);
    return {
      format: separated(blueprint.separator, item.format, { minCount: blueprint.minCount }),
      values: fc.array(item.values, { maxLength: 4 }),
    };
  }
  const first = build(blueprint.first);
  const second = build(blueprint.second);
  return {
    format: splitAt(blueprint.separator, first.format, second.format),
    values: fc.tuple(first.values, second.values),
  };
}

function tryBuild(blueprint: Blueprint): Sample | undefined {
  try {
    return build(blueprint);
  } catch {
    return undefined;
  }
}

const delimiterArbitrary = fc.constantFrom(...delimiters);

const leafBlueprintArbitrary: fc.Arbitrary<Blueprint> = fc.oneof(
  fc.record({
    kind: fc.constant<'number'>('number'),
    base: fc.constantFrom(2, 10, 16, 1, 17),
    width: fc.constantFrom(undefined, 0, 1, 2, 8),
  }),
  fc.record({
    kind: fc.constant<'chars'>('chars'),
    ranges: fc.constantFrom<string[]>(['09'], ['09', 'af'], ['[', ']'], ['/'], [], ["'", ',']),
    negated: fc.boolean(),
    minLength: fc.constantFrom(0, 1, 8),
    maxLength: fc.constantFrom(0, 8, Number.MAX_SAFE_INTEGER),
  })
);

function blueprintArbitrary(depth: number): fc.Arbitrary<Blueprint> {
  if (depth === 0) return leafBlueprintArbitrary;
  const inner = blueprintArbitrary(depth - 1);
  return fc.oneof(
    leafBlueprintArbitrary,
    fc.record({
      kind: fc.constant<'prefixed'>('prefixed'),
      text: fc.constantFrom('m/', '[', '', 'a🔐'),
      inner,
    }),
    fc.record({
      kind: fc.constant<'optionalSuffix'>('optionalSuffix'),
      mark: delimiterArbitrary,
      inner,
    }),
    fc.record({
      kind: fc.constant<'separated'>('separated'),
      separator: delimiterArbitrary,
      minCount: fc.constantFrom(0, 1, 3),
      item: inner,
    }),
    fc.record({
      kind: fc.constant<'split'>('split'),
      separator: delimiterArbitrary,
      first: inner,
      second: inner,
    })
  );
}

const caseArbitrary: fc.Arbitrary<Case> = blueprintArbitrary(blueprintDepth)
  .map(tryBuild)
  .filter(sample => sample !== undefined)
  .chain(sample => sample.values.map(value => ({ format: sample.format, value })));

const mutationArbitrary: fc.Arbitrary<Mutation> = fc.record({
  kind: fc.constantFrom<Mutation['kind']>('none', 'drop', 'insert', 'replace', 'random'),
  position: fc.nat(),
  character: fc.constantFrom(...characterPool),
  random: poolTextArbitrary,
});

function mutate(text: string, { kind, position, character, random }: Mutation): string {
  const characters = Array.from(text);
  if (kind === 'none') return text;
  if (kind === 'random' || characters.length === 0) return random;
  const index = position % characters.length;
  if (kind === 'drop') return characters.filter((_, at) => at !== index).join('');
  if (kind === 'insert')
    return [...characters.slice(0, index), character, ...characters.slice(index)].join('');
  return characters.map((existing, at) => (at === index ? character : existing)).join('');
}

function printCall({ format, value }: Case): string {
  return ['print', ...describeShape(format.shape), ...describeValue(format.toValue(value))].join(
    ' '
  );
}

function parseCall(format: Format<unknown>, text: string): string {
  return ['parse', ...describeShape(format.shape), codePointsOrDash(text)].join(' ');
}

function observePrint({ format, value }: Case): string {
  try {
    return `ok ${codePointsOrDash(format.print(value))}`;
  } catch {
    return 'throws';
  }
}

function observeParse(format: Format<unknown>, text: string): string {
  try {
    return ['ok', ...describeValue(format.toValue(format.parse(text)))].join(' ');
  } catch {
    return 'throws';
  }
}

function candidateText(sample: Case, mutation: Mutation): string {
  try {
    return mutate(sample.format.print(sample.value), mutation);
  } catch {
    return mutation.random;
  }
}

const smallLeafBlueprints: Blueprint[] = [
  { kind: 'number', base: 10, width: undefined },
  { kind: 'number', base: 16, width: 2 },
  { kind: 'number', base: 2, width: undefined },
  { kind: 'number', base: 1, width: undefined },
  { kind: 'chars', ranges: ['09'], negated: false, minLength: 0, maxLength: 2 },
  {
    kind: 'chars',
    ranges: ['/'],
    negated: true,
    minLength: 0,
    maxLength: Number.MAX_SAFE_INTEGER,
  },
  { kind: 'chars', ranges: ['az'], negated: false, minLength: 1, maxLength: 2 },
];

const smallBlueprints: Blueprint[] = [
  ...smallLeafBlueprints,
  ...['m/', ''].flatMap(text =>
    smallLeafBlueprints.map((inner): Blueprint => ({ kind: 'prefixed', text, inner }))
  ),
  ...["'", '0', 'a'].flatMap(mark =>
    smallLeafBlueprints.map((inner): Blueprint => ({ kind: 'optionalSuffix', mark, inner }))
  ),
  ...['/', '0'].flatMap(separator =>
    [1, 2].flatMap(minCount =>
      smallLeafBlueprints.map(
        (item): Blueprint => ({ kind: 'separated', separator, minCount, item })
      )
    )
  ),
  ...['/', 'a'].flatMap(separator =>
    smallLeafBlueprints.flatMap(first =>
      smallLeafBlueprints.map((second): Blueprint => ({ kind: 'split', separator, first, second }))
    )
  ),
];

const smallNumbers = [0, 1, 9, 10, 255, 256, Number.MAX_SAFE_INTEGER + 1];
const smallStrings = ['', '0', 'a', '/', "a'", '12'];
const valuesPerSide = 3;
const parseAlphabet = ['0', '1', 'a', '/', "'", 'm'];
const parseMaxLength = 3;

function smallValues(blueprint: Blueprint): unknown[] {
  if (blueprint.kind === 'number') return smallNumbers;
  if (blueprint.kind === 'chars') return smallStrings;
  if (blueprint.kind === 'prefixed') return smallValues(blueprint.inner);
  if (blueprint.kind === 'optionalSuffix')
    return smallValues(blueprint.inner)
      .slice(0, valuesPerSide)
      .flatMap(value => [
        [value, true],
        [value, false],
      ]);
  if (blueprint.kind === 'separated') {
    const items = smallValues(blueprint.item);
    return [[], items.slice(0, 1), items.slice(0, 2)];
  }
  const seconds = smallValues(blueprint.second).slice(0, valuesPerSide);
  return smallValues(blueprint.first)
    .slice(0, valuesPerSide)
    .flatMap(first => seconds.map(second => [first, second]));
}

function stringsUpTo(length: number): string[] {
  if (length === 0) return [''];
  const shorter = stringsUpTo(length - 1);
  const longest = shorter.filter(candidate => candidate.length === length - 1);
  return [...shorter, ...longest.flatMap(prefix => parseAlphabet.map(next => prefix + next))];
}

function shapeKinds(shape: Shape): string[] {
  if (shape.kind === 'prefixed' || shape.kind === 'optionalSuffix')
    return [shape.kind, ...shapeKinds(shape.inner)];
  if (shape.kind === 'separated') return [shape.kind, ...shapeKinds(shape.item)];
  if (shape.kind === 'split')
    return [shape.kind, ...shapeKinds(shape.first), ...shapeKinds(shape.second)];
  return [shape.kind];
}

const hexDigits = charactersIn('09', 'af');
const segment = optionalSuffix("'", numeral(10));
const derivationPath = prefixed('m/', separated('/', segment));
const keyOrigin = splitAt(
  '/',
  characters(hexDigits, { minLength: 8, maxLength: 8 }),
  separated('/', segment, { minCount: 3 })
);
const descriptor = prefixed(
  '[',
  splitAt(']', keyOrigin, characters(charactersExcept('[', ']'), { minLength: 1 }))
);

describe('text-format kernel', () => {
  test('prints and parses numbers in their base and width', () => {
    expect(numeral(10).print(84)).toBe('84');
    expect(numeral(10).parse('0')).toBe(0);
    expect(numeral(16, 8).print(0x0a3fd8ef)).toBe('0a3fd8ef');
    expect(numeral(16, 8).parse('0a3fd8ef')).toBe(0x0a3fd8ef);
    expect(numeral(16).print(0x0a3fd8ef)).toBe('a3fd8ef');
    expect(numeral(2, 4).print(5)).toBe('0101');
  });

  test('reads a derivation path into its segments and writes it back', () => {
    const segments: [number, boolean][] = [
      [84, true],
      [0, true],
      [0, true],
      [1, false],
      [7, false],
    ];
    expect(derivationPath.parse("m/84'/0'/0'/1/7")).toEqual(segments);
    expect(derivationPath.print(segments)).toBe("m/84'/0'/0'/1/7");
  });

  test('reads a descriptor into its key origin and key and writes it back', () => {
    const text = "[0a3fd8ef/84'/0'/6']xpub6CUGRUo";
    expect(descriptor.parse(text)).toEqual([
      [
        '0a3fd8ef',
        [
          [84, true],
          [0, true],
          [6, true],
        ],
      ],
      'xpub6CUGRUo',
    ]);
    expect(descriptor.print(descriptor.parse(text))).toBe(text);
  });

  test.each([
    ['a number with a leading zero', 'm/084'],
    ['a number followed by letters', "m/12abc'"],
    ['a signed number', 'm/-1'],
    ['a spaced number', 'm/ 3'],
    ['an empty segment', "m/84'//0"],
    ['a trailing slash', "m/84'/"],
    ['a doubled hardened mark', "m/84''"],
    ['a different hardened mark', 'm/84h'],
    ['a missing root', "84'/0'"],
    ['a number above the largest safe integer', 'm/9007199254740992'],
  ])('rejects a path with %s', (_label, text) => {
    expect(() => derivationPath.parse(text)).toThrowError(
      new RangeError('Text is not valid for this format.')
    );
  });

  test.each([
    ['no brackets', "0a3fd8ef/84'/0'/0'xpub"],
    ['an upper-case fingerprint', "[0A3FD8EF/84'/0'/0']xpub"],
    ['a short fingerprint', "[a3fd8ef/84'/0'/0']xpub"],
    ['too few path segments', "[0a3fd8ef/84'/0']xpub"],
    ['no key', "[0a3fd8ef/84'/0'/0']"],
    ['a bracket in the key', "[0a3fd8ef/84'/0'/0']xp]ub"],
    ['a wrapper around it', "wpkh([0a3fd8ef/84'/0'/0']xpub)"],
  ])('rejects a descriptor with %s', (_label, text) => {
    expect(() => descriptor.parse(text)).toThrowError(RangeError);
  });

  test('rejects values its format cannot hold', () => {
    expect(() => numeral(16, 8).print(2 ** 32)).toThrowError(RangeError);
    expect(() => numeral(10).print(-1)).toThrowError(RangeError);
    expect(() => numeral(10).print(1.5)).toThrowError(RangeError);
    expect(() => numeral(10).print(Number.MAX_SAFE_INTEGER + 1)).toThrowError(RangeError);
    expect(() => derivationPath.print([])).toThrowError(RangeError);
    expect(() => keyOrigin.print(['0A3FD8EF', [[84, true]]])).toThrowError(RangeError);
  });

  test('rejects text with a lone surrogate', () => {
    const anything = characters(charactersExcept());
    expect(() => anything.parse('a\ud800')).toThrowError(TypeError);
    expect(() => anything.print('\udfff')).toThrowError(TypeError);
    expect(anything.parse('🔐')).toBe('🔐');
  });

  test('refuses to build a format whose delimiter could appear in the part before it', () => {
    const refusal = new RangeError('The part before a delimiter must not be able to contain it.');
    expect(() => separated('/', characters(charactersExcept('[')))).toThrowError(refusal);
    expect(() => splitAt('7', numeral(10), numeral(10))).toThrowError(refusal);
    expect(() => optionalSuffix('a', numeral(16))).toThrowError(refusal);
    expect(() => optionalSuffix('a', numeral(10))).not.toThrowError();
    expect(() => numeral(1)).toThrowError(RangeError);
    expect(() => numeral(17)).toThrowError(RangeError);
    expect(() => separated('//', numeral(10))).toThrowError(RangeError);
  });

  test('reads back exactly the value that was written', () => {
    fc.assert(
      fc.property(caseArbitrary, sample => {
        fc.pre(observePrint(sample) !== 'throws');
        expect(sample.format.parse(sample.format.print(sample.value))).toEqual(sample.value);
      }),
      { numRuns: 500 }
    );
  });

  test('accepts only the text it would itself write for the value it read', () => {
    fc.assert(
      fc.property(caseArbitrary, mutationArbitrary, (sample, mutation) => {
        const candidate = candidateText(sample, mutation);
        fc.pre(observeParse(sample.format, candidate) !== 'throws');
        expect(sample.format.print(sample.format.parse(candidate))).toBe(candidate);
      }),
      { numRuns: 500 }
    );
  });
});

describe('Lean model of the text-format kernel', () => {
  test.runIf(leanOracleRequired)('has the Lean oracle built when it is required', () => {
    expect(leanOracleAvailable).toBe(true);
  });

  test.skipIf(!leanOracleAvailable)('agrees with the kernel on a descriptor', () => {
    const text = "[0a3fd8ef/84'/0'/6']xpub6CUGRUo";
    expect(askLeanOracle([parseCall(descriptor, text)])).toEqual([observeParse(descriptor, text)]);
    expect(observeParse(descriptor, text)).not.toBe('throws');
  });

  test.skipIf(!leanOracleAvailable)(
    'agrees with the kernel on every small format, value and string',
    () => {
      const attempts = smallBlueprints.map(blueprint => ({
        blueprint,
        format: tryBuild(blueprint)?.format,
      }));
      expect(attempts.map(({ format }) => (format === undefined ? 'rejected' : 'ok'))).toEqual(
        askLeanOracle(
          attempts.map(({ blueprint }) => ['check', ...describeBlueprint(blueprint)].join(' '))
        )
      );

      const candidates = stringsUpTo(parseMaxLength);
      const prints: Case[] = [];
      const parses: { format: Format<unknown>; text: string }[] = [];
      for (const { blueprint, format } of attempts) {
        if (format === undefined) continue;
        prints.push(...smallValues(blueprint).map(value => ({ format, value })));
        parses.push(...candidates.map(text => ({ format, text })));
      }

      expect(prints.map(observePrint)).toEqual(askLeanOracle(prints.map(printCall)));
      expect(parses.map(({ format, text }) => observeParse(format, text))).toEqual(
        askLeanOracle(parses.map(({ format, text }) => parseCall(format, text)))
      );

      const exercised = new Set(parses.flatMap(({ format }) => shapeKinds(format.shape)));
      const kernelSource = readKernelSource('./format/format.ts');
      expect([...exercised].sort()).toEqual(typeScriptKinds(kernelSource, 'Shape').sort());
    }
  );

  test.skipIf(!leanOracleAvailable)('agrees with the kernel on which formats may be built', () => {
    const seen = { accepted: 0, rejected: 0 };
    fc.assert(
      fc.property(
        fc.array(blueprintArbitrary(blueprintDepth), {
          minLength: 1,
          maxLength: oracleBatchSize,
        }),
        blueprints => {
          const answers = askLeanOracle(
            blueprints.map(blueprint => ['check', ...describeBlueprint(blueprint)].join(' '))
          );
          blueprints.forEach((blueprint, index) => {
            const sample = tryBuild(blueprint);
            const call = describeBlueprint(blueprint).join(' ');
            const typescript = sample === undefined ? 'rejected' : 'ok';
            expect({ call, typescript }).toEqual({ call, typescript: answers[index] });
            if (sample === undefined) seen.rejected += 1;
            else {
              seen.accepted += 1;
              expect(describeShape(sample.format.shape)).toEqual(describeBlueprint(blueprint));
            }
          });
        }
      ),
      { numRuns: 200, endOnFailure: true }
    );
    expect(seen.accepted).toBeGreaterThan(0);
    expect(seen.rejected).toBeGreaterThan(0);
  });

  test.skipIf(!leanOracleAvailable)(
    'agrees with the kernel on what every generated format prints',
    () => {
      const seen = { accepted: 0, rejected: 0 };
      fc.assert(
        fc.property(
          fc.array(caseArbitrary, { minLength: 1, maxLength: oracleBatchSize }),
          cases => {
            const answers = askLeanOracle(cases.map(printCall));
            expect(answers).toHaveLength(cases.length);
            cases.forEach((sample, index) => {
              const call = printCall(sample);
              const typescript = observePrint(sample);
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
    'agrees with the kernel on what every generated format parses, from valid and damaged text',
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
              format: sample.format,
              text: candidateText(sample, mutation),
            }));
            const answers = askLeanOracle(
              candidates.map(({ format, text }) => parseCall(format, text))
            );
            expect(answers).toHaveLength(candidates.length);
            candidates.forEach(({ format, text }, index) => {
              const call = parseCall(format, text);
              const typescript = observeParse(format, text);
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
});
