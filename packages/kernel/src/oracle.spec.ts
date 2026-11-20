import { describe, expect, test } from 'vitest';

import {
  askLeanOracle,
  leanConstructors,
  leanOracleAvailable,
  leanOracleRequired,
  readKernelSource,
  typeScriptKinds,
} from './lean-oracle';

const codecModel = readKernelSource('./codec/Codec.lean');
const codecKernel = readKernelSource('./codec/codec.ts');
const formatModel = readKernelSource('./format/Format.lean');
const formatKernel = readKernelSource('./format/format.ts');
const oracleSource = readKernelSource('./Oracle.lean');

const fnvOffsetBasis = 0x811c9dc5;
const fnvPrime = 16777619;

function fnv1a(text: string): number {
  let hash = fnvOffsetBasis;
  for (const byte of new TextEncoder().encode(text)) {
    hash = Math.imul(hash ^ byte, fnvPrime) >>> 0;
  }
  return hash;
}

function sorted(names: string[]): string[] {
  return [...names].sort();
}

describe('Lean model and TypeScript kernel', () => {
  test.each([
    ['codec shapes', leanConstructors(codecModel, 'Shape'), typeScriptKinds(codecKernel, 'Shape')],
    [
      'codec integer forms',
      leanConstructors(codecModel, 'IntCodec'),
      typeScriptKinds(codecKernel, 'IntShape'),
    ],
    [
      'codec byte orders',
      leanConstructors(codecModel, 'Endian'),
      typeScriptKinds(codecKernel, 'Endian'),
    ],
    ['codec tails', leanConstructors(codecModel, 'Tail'), typeScriptKinds(codecKernel, 'Tail')],
    ['codec values', leanConstructors(codecModel, 'Value'), typeScriptKinds(codecKernel, 'Value')],
    [
      'format shapes',
      leanConstructors(formatModel, 'Shape'),
      typeScriptKinds(formatKernel, 'Shape'),
    ],
    [
      'format values',
      leanConstructors(formatModel, 'Value'),
      typeScriptKinds(formatKernel, 'Value'),
    ],
  ])('have the same %s', (_label, model, kernel) => {
    expect(model.length).toBeGreaterThan(0);
    expect(sorted(kernel)).toEqual(sorted(model));
  });
});

describe('Lean oracle', () => {
  test.runIf(leanOracleRequired)('is built when it is required', () => {
    expect(leanOracleAvailable).toBe(true);
  });

  test.skipIf(!leanOracleAvailable)(
    'was built from the model sources as they are now; rebuild with `lake build` if this fails',
    () => {
      const fingerprint = fnv1a(codecModel + formatModel + oracleSource);
      expect(askLeanOracle(['version'])).toEqual([`ok ${fingerprint}`]);
    }
  );
});
