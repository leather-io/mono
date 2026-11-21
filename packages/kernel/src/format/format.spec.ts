import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import {
  type Format,
  characters,
  charactersExcept,
  charactersIn,
  fields,
  fieldsThenMore,
  leading,
  numeral,
  optionalSuffix,
  prefixed,
  separated,
  splitAt,
} from './format';

type Value = ReturnType<Format<unknown>['toValue']>;

type Blueprint =
  | { kind: 'number'; base: number; width: number | undefined }
  | { kind: 'chars'; ranges: string[]; negated: boolean; minLength: number; maxLength: number }
  | { kind: 'prefixed'; text: string; inner: Blueprint }
  | { kind: 'optionalSuffix'; mark: string; inner: Blueprint }
  | { kind: 'separated'; separator: string; minCount: number; item: Blueprint }
  | { kind: 'split'; separator: string; first: Blueprint; second: Blueprint }
  | { kind: 'leading'; separator: string; first: Blueprint; rest: Blueprint };

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
const blueprintDepth = 3;
const delimiters = ['/', "'", ']', ':', ','];
const characterPool = ['0', '1', '7', '9', 'a', 'f', 'g', 'x', 'A', '🔐', ...delimiters, '['];

function codePoint(character: string): string {
  return (character.codePointAt(0) ?? 0).toString(16);
}

function codePointsOrDash(text: string): string {
  return text === '' ? '-' : Array.from(text, codePoint).join(',');
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
  if (blueprint.kind === 'leading') {
    const first = build(blueprint.first);
    const rest = build(blueprint.rest);
    return {
      format: leading(blueprint.separator, first.format, rest.format),
      values: fc.tuple(first.values, fc.array(rest.values, { maxLength: 3 })),
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
    }),
    fc.record({
      kind: fc.constant<'leading'>('leading'),
      separator: delimiterArbitrary,
      first: inner,
      rest: inner,
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
  ...['/', 'a'].flatMap(separator =>
    smallLeafBlueprints.flatMap(first =>
      smallLeafBlueprints.map((rest): Blueprint => ({ kind: 'leading', separator, first, rest }))
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
  if (blueprint.kind === 'leading') {
    const others = smallValues(blueprint.rest);
    return smallValues(blueprint.first)
      .slice(0, valuesPerSide)
      .flatMap(first => [
        [first, []],
        [first, others.slice(0, 1)],
        [first, others.slice(0, 2)],
      ]);
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

  test('reads one part and then any number of further parts', () => {
    const format = leading('/', numeral(16, 2), optionalSuffix("'", numeral(10)));
    expect(format.parse('0a')).toEqual([10, []]);
    expect(format.parse("0a/84'/7")).toEqual([
      10,
      [
        [84, true],
        [7, false],
      ],
    ]);
    expect(format.print([10, [[84, true]]])).toBe("0a/84'");
    expect(format.print([10, []])).toBe('0a');
    expect(() => format.parse('0a/')).toThrowError(RangeError);
  });

  test('gives the parts of a format names, so they are read by name and not by position', () => {
    const keyPath = fields('/', ['change', numeral(2, 1)], ['index', numeral(10)]);
    expect(keyPath.parse('1/7')).toEqual({ change: 1, index: 7 });
    expect(keyPath.print({ index: 7, change: 1 })).toBe('1/7');

    const version = fields(
      '.',
      ['major', numeral(10)],
      ['minor', numeral(10)],
      ['patch', numeral(10)]
    );
    expect(version.parse('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
    expect(version.print({ patch: 3, minor: 2, major: 1 })).toBe('1.2.3');
    expect(() => version.parse('1.2')).toThrowError(RangeError);
  });

  test('names the fixed parts and collects any further parts under their own name', () => {
    const path = fieldsThenMore(
      '/',
      ['root', characters(charactersExcept('/'), { minLength: 1 })],
      ['purpose', numeral(10)],
      ['account', numeral(10)],
      ['rest', numeral(10)]
    );
    expect(path.parse('m/84/7')).toEqual({ root: 'm', purpose: 84, account: 7, rest: [] });
    expect(path.parse('m/84/7/1/5')).toEqual({ root: 'm', purpose: 84, account: 7, rest: [1, 5] });
    expect(path.print({ root: 'm', purpose: 84, account: 7, rest: [1, 5] })).toBe('m/84/7/1/5');
    expect(path.print({ root: 'm', purpose: 84, account: 7, rest: [] })).toBe('m/84/7');
    expect(() => path.parse('m/84')).toThrowError(RangeError);
  });

  test('refuses two parts with the same name', () => {
    expect(() => fields('/', ['index', numeral(10)], ['index', numeral(10)])).toThrowError(
      new RangeError('Field names must be different.')
    );
    expect(() => fieldsThenMore('/', ['index', numeral(10)], ['index', numeral(10)])).toThrowError(
      RangeError
    );
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
});

const propertyRuns = 3200;
const structuralRuns = propertyRuns / 2;
const digitCharacters = '0123456789abcdef';

function tryPrint(format: Format<unknown>, value: unknown): string | undefined {
  try {
    return format.print(value);
  } catch {
    return undefined;
  }
}

function tryParse(format: Format<unknown>, text: string): { value: unknown } | undefined {
  try {
    return { value: format.parse(text) };
  } catch {
    return undefined;
  }
}

function shown(format: Format<unknown>, value: unknown): string {
  return describeValue(format.toValue(value)).join(' ');
}

function joinedParts(parts: (string | undefined)[], separator: string): string | undefined {
  const present = parts.flatMap(part => (part === undefined ? [] : [part]));
  return present.length === parts.length ? present.join(separator) : undefined;
}

function checkRoundTrip(format: Format<unknown>, value: unknown) {
  const text = tryPrint(format, value);
  if (text === undefined) return;
  const back = tryParse(format, text);
  expect(back && shown(format, back.value)).toBe(shown(format, value));
}

function checkCanonical(format: Format<unknown>, candidate: string) {
  const back = tryParse(format, candidate);
  if (!back) return;
  expect(tryPrint(format, back.value)).toBe(candidate);
}

function checkReadsBack(format: Format<unknown>, value: unknown) {
  const text = tryPrint(format, value);
  if (text === undefined) return;
  expect(tryParse(format, text)?.value).toEqual(value);
}

function numeralValue(base: number, width: number | undefined, candidate: string) {
  const allowed = digitCharacters.slice(0, base);
  const digits = Array.from(candidate);
  const hasRightLength =
    width === undefined ? candidate === '0' || digits[0] !== '0' : digits.length === width;
  if (digits.length === 0 || !hasRightLength) return undefined;
  if (digits.some(digit => !allowed.includes(digit))) return undefined;
  const value = digits.reduce(
    (total, digit) => total * BigInt(base) + BigInt(allowed.indexOf(digit)),
    0n
  );
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : undefined;
}

function rangeHolds(range: string, character: string): boolean {
  const [low, high = low] = Array.from(range);
  return low !== undefined && high !== undefined && low <= character && character <= high;
}

function canContain(blueprint: Blueprint, character: string): boolean {
  if (blueprint.kind === 'number')
    return digitCharacters.slice(0, blueprint.base).includes(character);
  if (blueprint.kind === 'chars')
    return blueprint.ranges.some(range => rangeHolds(range, character)) !== blueprint.negated;
  if (blueprint.kind === 'prefixed')
    return blueprint.text.includes(character) || canContain(blueprint.inner, character);
  if (blueprint.kind === 'optionalSuffix')
    return blueprint.mark === character || canContain(blueprint.inner, character);
  if (blueprint.kind === 'separated')
    return blueprint.separator === character || canContain(blueprint.item, character);
  const others = blueprint.kind === 'leading' ? blueprint.rest : blueprint.second;
  return (
    blueprint.separator === character ||
    canContain(blueprint.first, character) ||
    canContain(others, character)
  );
}

const probeCharacters = ['/', "'", ':', '0', '1', '9', 'a', 'f', 'm', 'z'];

interface Leaf {
  format: Format<unknown>;
  values: fc.Arbitrary<unknown>;
}

interface CharacterSetCase {
  set: ReturnType<typeof charactersIn>;
  has(character: string): boolean;
}

const characterSetCases: CharacterSetCase[] = [
  {
    set: charactersIn('09', 'af'),
    has(character) {
      return /^[0-9a-f]$/.test(character);
    },
  },
  {
    set: charactersExcept('/', '['),
    has(character) {
      return character !== '/' && character !== '[';
    },
  },
  {
    set: charactersIn('a'),
    has(character) {
      return character === 'a';
    },
  },
  {
    set: charactersExcept(),
    has() {
      return true;
    },
  },
];

const shortPoolTextArbitrary = fc
  .array(fc.constantFrom(...characterPool), { maxLength: 6 })
  .map(parts => parts.join(''));

const anyNumberArbitrary = fc.oneof(
  natArbitrary,
  fc.constantFrom(9, 15, 16, -1, 1.5, Number.NaN, 2 ** 53, 2 ** 64)
);

const digitTextArbitrary = fc
  .array(fc.constantFrom(...Array.from(`${digitCharacters}gA-+ `)), { maxLength: 18 })
  .map(parts => parts.join(''));

const lowerWordArbitrary = fc
  .array(fc.constantFrom('a', 'b', 'z'), { minLength: 1, maxLength: 3 })
  .map(parts => parts.join(''));

const leafArbitrary = fc.constantFrom<Leaf>(
  { format: numeral(10), values: natArbitrary },
  { format: numeral(16, 14), values: natArbitrary },
  { format: numeral(2), values: fc.nat({ max: 4096 }) },
  {
    format: characters(charactersIn('az'), { minLength: 1, maxLength: 3 }),
    values: lowerWordArbitrary,
  }
);

const leafCaseArbitrary: fc.Arbitrary<Case> = leafArbitrary.chain(({ format, values }) =>
  values.map(value => ({ format, value }))
);

function leafItemsArbitrary(maxLength: number) {
  return leafArbitrary.chain(({ format, values }) =>
    fc.array(values, { maxLength }).map(items => ({ format, items }))
  );
}

const separatorArbitrary = fc.constantFrom(':', ',', '/', '🔐');

describe('text-format kernel properties', () => {
  test('small cases: parsing what was printed gives the value back', () => {
    for (const blueprint of smallBlueprints) {
      const sample = tryBuild(blueprint);
      if (!sample) continue;
      for (const value of smallValues(blueprint)) checkRoundTrip(sample.format, value);
    }
  });

  test('small cases: parsing accepts only what printing writes', () => {
    const candidates = stringsUpTo(parseMaxLength);
    for (const blueprint of smallBlueprints) {
      const sample = tryBuild(blueprint);
      if (!sample) continue;
      for (const candidate of candidates) checkCanonical(sample.format, candidate);
    }
  });

  test('small cases: a separated list is refused exactly when its items can contain the separator', () => {
    for (const item of smallBlueprints) {
      if (!tryBuild(item)) continue;
      for (const separator of probeCharacters) {
        const list = tryBuild({ kind: 'separated', separator, minCount: 1, item });
        expect([separator, item, list !== undefined]).toEqual([
          separator,
          item,
          !canContain(item, separator),
        ]);
      }
    }
  });

  test('parsing what was printed gives the value back, for every format that can be built', () => {
    fc.assert(
      fc.property(caseArbitrary, ({ format, value }) => checkRoundTrip(format, value)),
      { numRuns: propertyRuns, endOnFailure: true }
    );
  });

  test('parsing accepts only what printing writes', () => {
    fc.assert(
      fc.property(caseArbitrary, mutationArbitrary, (sample, mutation) =>
        checkCanonical(sample.format, candidateText(sample, mutation))
      ),
      { numRuns: propertyRuns, endOnFailure: true }
    );
  });

  test('a numeral is the number in its base, padded to its width, and refused outside its range', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(2, 8, 10, 16),
        fc.option(fc.integer({ min: 1, max: 20 }), { nil: undefined }),
        anyNumberArbitrary,
        (base, width, n) => {
          const isNatural = Number.isSafeInteger(n) && n >= 0;
          const digits = isNatural ? n.toString(base) : '';
          const fits = isNatural && (width === undefined || digits.length <= width);
          const padded = width === undefined ? digits : digits.padStart(width, '0');
          const expected = fits ? padded : undefined;
          expect(tryPrint(numeral(base, width), n)).toBe(expected);
          if (expected !== undefined)
            expect(tryParse(numeral(base, width), expected)?.value).toBe(n);
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('a numeral is read only in its shortest or padded form, from its own digits', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(2, 10, 16),
        fc.option(fc.integer({ min: 1, max: 18 }), { nil: undefined }),
        digitTextArbitrary,
        (base, width, candidate) => {
          expect(tryParse(numeral(base, width), candidate)?.value).toBe(
            numeralValue(base, width, candidate)
          );
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('characters are text from the set within the length limits, and nothing else', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...characterSetCases),
        fc.nat({ max: 3 }),
        fc.nat({ max: 5 }),
        shortPoolTextArbitrary,
        ({ set, has }, minLength, maxLength, candidate) => {
          const format = characters(set, { minLength, maxLength });
          const symbols = Array.from(candidate);
          const isValid =
            symbols.every(has) && symbols.length >= minLength && symbols.length <= maxLength;
          expect(tryPrint(format, candidate)).toBe(isValid ? candidate : undefined);
          expect(tryParse(format, candidate)?.value).toBe(isValid ? candidate : undefined);
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('prefixed is the text and then the inner format', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('m/', '[', '', 'a🔐'),
        leafCaseArbitrary,
        shortPoolTextArbitrary,
        (start, inner, other) => {
          const printed = tryPrint(inner.format, inner.value);
          expect(tryPrint(prefixed(start, inner.format), inner.value)).toBe(
            printed === undefined ? undefined : start + printed
          );
          const expected = other.startsWith(start)
            ? tryParse(inner.format, other.slice(start.length))
            : undefined;
          expect(tryParse(prefixed(start, inner.format), other)).toEqual(expected);
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('an optional suffix is the inner format with or without its mark', () => {
    fc.assert(
      fc.property(
        leafCaseArbitrary,
        fc.constantFrom("'", '!', '🔐'),
        fc.boolean(),
        (inner, mark, isMarked) => {
          const printed = tryPrint(inner.format, inner.value);
          const format = optionalSuffix(mark, inner.format);
          expect(tryPrint(format, [inner.value, isMarked])).toBe(
            printed === undefined ? undefined : printed + (isMarked ? mark : '')
          );
          checkReadsBack(format, [inner.value, isMarked]);
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('separated is its items joined, with at least the minimum count and at least one', () => {
    fc.assert(
      fc.property(
        leafItemsArbitrary(5),
        separatorArbitrary,
        fc.nat({ max: 4 }),
        ({ format, items }, separator, minCount) => {
          const joined = joinedParts(
            items.map(item => tryPrint(format, item)),
            separator
          );
          const hasEnough = items.length >= Math.max(1, minCount);
          const whole = tryPrint(separated(separator, format, { minCount }), items);
          expect(whole).toBe(hasEnough ? joined : undefined);
          if (whole === undefined) return;
          checkReadsBack(separated(separator, format, { minCount }), items);
          expect(
            tryParse(separated(separator, format, { minCount: items.length + 1 }), whole)
          ).toBeUndefined();
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('a split is two parts around the first separator, and leading is one part then more', () => {
    fc.assert(
      fc.property(
        leafCaseArbitrary,
        leafItemsArbitrary(4),
        separatorArbitrary,
        (first, more, separator) => {
          const head = tryPrint(first.format, first.value);
          const joined = joinedParts(
            [head, ...more.items.map(item => tryPrint(more.format, item))],
            separator
          );
          const value = [first.value, more.items];

          const led = leading(separator, first.format, more.format);
          expect(tryPrint(led, value)).toBe(joined);
          checkReadsBack(led, value);

          if (more.items.length === 0) return;
          const cut = splitAt(separator, first.format, separated(separator, more.format));
          expect(tryPrint(cut, value)).toBe(joined);
          checkReadsBack(cut, value);
          if (head !== undefined) expect(tryParse(cut, head)).toBeUndefined();
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('named parts are their parts in order, read back under their names', () => {
    fc.assert(
      fc.property(
        leafCaseArbitrary,
        leafCaseArbitrary,
        leafCaseArbitrary,
        leafItemsArbitrary(3),
        separatorArbitrary,
        (a, b, c, more, separator) => {
          const pieces = [a, b, c].map(part => tryPrint(part.format, part.value));
          const tail = more.items.map(item => tryPrint(more.format, item));
          const value = { a: a.value, b: b.value, c: c.value };

          const named = fields(separator, ['a', a.format], ['b', b.format], ['c', c.format]);
          expect(tryPrint(named, value)).toBe(joinedParts(pieces, separator));
          checkReadsBack(named, value);

          const open = fieldsThenMore(
            separator,
            ['a', a.format],
            ['b', b.format],
            ['c', c.format],
            ['rest', more.format]
          );
          const openValue = { ...value, rest: more.items };
          expect(tryPrint(open, openValue)).toBe(joinedParts([...pieces, ...tail], separator));
          checkReadsBack(open, openValue);
        }
      ),
      { numRuns: structuralRuns, endOnFailure: true }
    );
  });

  test('constructors refuse what cannot be parsed unambiguously and accept what can', () => {
    for (const base of [0, 1, 17, 1.5, -2]) expect(() => numeral(base)).toThrow();
    for (const width of [0, -1, 1.5]) expect(() => numeral(10, width)).toThrow();
    expect(() => separated('//', numeral(10))).toThrow();
    expect(() => separated('', numeral(10))).toThrow();
    expect(() => characters(charactersIn('az'), { minLength: -1 })).toThrow();
    expect(() => fields('/', ['a', numeral(10)], ['a', numeral(10)])).toThrow();
    const anything = characters(charactersExcept());
    expect(() => separated('/', anything)).toThrow();
    expect(() => splitAt('/', anything, numeral(10))).toThrow();
    expect(() => optionalSuffix('/', anything)).toThrow();
    expect(() => leading('/', anything, numeral(10))).toThrow();
    expect(() => leading('/', numeral(10), anything)).toThrow();
    expect(() => splitAt('7', numeral(10), numeral(10))).toThrow();
    expect(() => optionalSuffix('a', numeral(16))).toThrow();
    expect(() => separated('m', prefixed('m/', numeral(10)))).toThrow();
    expect(() => separated('/', splitAt(':', numeral(10), anything))).toThrow();
    expect(() => separated("'", optionalSuffix("'", numeral(10)))).toThrow();
    expect(() => separated('/', separated('/', numeral(10)))).toThrow();
    expect(() => separated('/', leading(':', numeral(10), anything))).toThrow();

    const safe = characters(charactersExcept('/', "'", ':'));
    expect(() => separated('/', optionalSuffix("'", numeral(10)))).not.toThrow();
    expect(() => splitAt('/', safe, anything)).not.toThrow();
    expect(() => optionalSuffix('a', numeral(10))).not.toThrow();
    expect(() => leading('/', safe, numeral(16))).not.toThrow();
    expect(() => separated(':', splitAt('/', numeral(10), safe))).not.toThrow();
    expect(() => prefixed('/', separated('/', numeral(10)))).not.toThrow();
    expect(() => numeral(2, 1)).not.toThrow();
    expect(() => numeral(16, 8)).not.toThrow();
  });

  test('text with a lone surrogate is refused', () => {
    const anything = characters(charactersExcept());
    expect(() => anything.parse('a\ud800')).toThrow();
    expect(() => anything.print('\udfff')).toThrow();
    expect(anything.parse('🔐')).toBe('🔐');
  });
});
