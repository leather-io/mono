import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import {
  appendAddressIndexToPath,
  createDescriptor,
  createKeyOriginPath,
  decomposeDescriptor,
  extractAccountIndexFromDescriptor,
  extractAccountIndexFromPath,
  extractAccountPathFromFullPath,
  extractAddressIndexFromPath,
  extractChangeIndexFromPath,
  extractDerivationPathFromDescriptor,
  extractFingerprintFromDescriptor,
  extractFingerprintFromKeyOriginPath,
  extractKeyFromDescriptor,
  extractKeyOriginPathFromDescriptor,
  extractPurposeFromPath,
  keyOriginToDerivationPath,
  validateKeyOriginPath,
} from './derivation-path-utils';

const invalidText = 'Text is not valid for this format.';

interface Segment {
  index: number;
  hardened: boolean;
}

const hexDigits = Array.from('0123456789abcdef');

const fingerprintArbitrary = fc.string({
  unit: fc.constantFrom(...hexDigits),
  minLength: 8,
  maxLength: 8,
});

const segmentArbitrary: fc.Arbitrary<Segment> = fc.record({
  index: fc.oneof(fc.nat(), fc.nat({ max: 20 })),
  hardened: fc.boolean(),
});

const indexArbitrary = fc.oneof(fc.nat(), fc.maxSafeNat(), fc.constantFrom(0, 1));

const keyArbitrary = fc.string({
  unit: fc.constantFrom(...Array.from('xpubtABC0123456789/')),
  minLength: 1,
  maxLength: 12,
});

function printSegment({ index, hardened }: Segment): string {
  return hardened ? `${index}'` : String(index);
}

function printSegments(segments: Segment[]): string {
  return segments.map(printSegment).join('/');
}

const accountSegmentsArbitrary = fc.array(segmentArbitrary, { minLength: 3, maxLength: 3 });
const fullSegmentsArbitrary = fc.array(segmentArbitrary, { minLength: 5, maxLength: 5 });
const rootArbitrary = fc.oneof(fc.constant('m'), fingerprintArbitrary);

describe('path segment extractors', () => {
  test('read the number at their own depth, hardened or not, under either kind of root', () => {
    fc.assert(
      fc.property(rootArbitrary, fullSegmentsArbitrary, (root, segments) => {
        const path = `${root}/${printSegments(segments)}`;
        expect(extractPurposeFromPath(path)).toBe(segments[0].index);
        expect(extractAccountIndexFromPath(path)).toBe(segments[2].index);
        expect(extractChangeIndexFromPath(path)).toBe(segments[3].index);
        expect(extractAddressIndexFromPath(path)).toBe(segments[4].index);
      })
    );
  });

  test.each([
    ['a number followed by letters', "m/84'/0'/12abc'"],
    ['a descriptor passed by mistake', "[0a3fd8ef/84'/0'/7']xpub"],
  ])('throw for %s', (_label, path) => {
    expect(() => extractPurposeFromPath(path)).toThrowError(invalidText);
    expect(() => extractAccountIndexFromPath(path)).toThrowError(invalidText);
  });

  test('throw for a path that stops before their depth', () => {
    expect(() => extractAccountIndexFromPath("m/84'/0'")).toThrowError(
      'Cannot parse Account from path'
    );
    expect(() => extractAddressIndexFromPath("m/84'/0'/0'/0")).toThrowError(
      'Cannot parse AddressIndex from path'
    );
  });
});

describe(appendAddressIndexToPath.name, () => {
  test('appends the change and then the address index, which the extractors read back', () => {
    fc.assert(
      fc.property(
        rootArbitrary,
        accountSegmentsArbitrary,
        indexArbitrary,
        indexArbitrary,
        (root, segments, change, addressIndex) => {
          const accountPath = `${root}/${printSegments(segments)}`;
          const fullPath = appendAddressIndexToPath(accountPath, change, addressIndex);
          expect(fullPath).toBe(`${accountPath}/${change}/${addressIndex}`);
          expect(extractChangeIndexFromPath(fullPath)).toBe(change);
          expect(extractAddressIndexFromPath(fullPath)).toBe(addressIndex);
        }
      )
    );
  });

  test('throws for a path with no account level', () => {
    expect(() => appendAddressIndexToPath("m/84'/0'", 0, 0)).toThrowError(
      'Invalid path, must have account index'
    );
  });
});

describe('key origin paths', () => {
  test('swap the root of a derivation path for the fingerprint, and back', () => {
    fc.assert(
      fc.property(fingerprintArbitrary, accountSegmentsArbitrary, (fingerprint, segments) => {
        const path = `m/${printSegments(segments)}`;
        const keyOrigin = createKeyOriginPath(fingerprint, path);
        expect(keyOrigin).toBe(`${fingerprint}/${printSegments(segments)}`);
        expect(extractFingerprintFromKeyOriginPath(keyOrigin)).toBe(fingerprint);
        expect(keyOriginToDerivationPath(keyOrigin)).toBe(path);
        expect(validateKeyOriginPath(keyOrigin)).toBe(true);
      })
    );
  });

  test('reject a fingerprint that is not lower-case hexadecimal of at most 8 characters', () => {
    expect(() => createKeyOriginPath('0A3FD8EF', "m/84'/0'/0'")).toThrowError(RangeError);
    expect(() => createKeyOriginPath('0a3fd8ef0', "m/84'/0'/0'")).toThrowError(RangeError);
    expect(() => extractFingerprintFromKeyOriginPath("0A3FD8EF/84'/0'/0'")).toThrowError(
      invalidText
    );
  });

  test('accept the short fingerprints that older builds saved without padding', () => {
    expect(extractFingerprintFromKeyOriginPath("f25e8/44'/5757'/0'/0/0")).toBe('f25e8');
    expect(extractFingerprintFromDescriptor("[f25e8/44'/5757'/0'/0/0]03ab")).toBe('f25e8');
  });

  test('are not valid as a bare derivation path or above account level', () => {
    expect(() => validateKeyOriginPath("m/84'/0'/0'")).toThrowError(invalidText);
    expect(() => validateKeyOriginPath("0a3fd8ef/84'/0'")).toThrowError(invalidText);
  });

  test('take a derivation path only with its m root', () => {
    expect(() => createKeyOriginPath('0a3fd8ef', "84'/0'/0'")).toThrowError(invalidText);
  });
});

describe('descriptors', () => {
  test('give back the key origin, key and every part that went into them', () => {
    fc.assert(
      fc.property(
        fingerprintArbitrary,
        accountSegmentsArbitrary,
        keyArbitrary,
        (fingerprint, segments, key) => {
          const keyOrigin = `${fingerprint}/${printSegments(segments)}`;
          const descriptor = createDescriptor(keyOrigin, key);
          expect(descriptor).toBe(`[${keyOrigin}]${key}`);
          expect(extractKeyOriginPathFromDescriptor(descriptor)).toBe(keyOrigin);
          expect(extractKeyFromDescriptor(descriptor)).toBe(key);
          expect(extractFingerprintFromDescriptor(descriptor)).toBe(fingerprint);
          expect(extractDerivationPathFromDescriptor(descriptor)).toBe(
            `m/${printSegments(segments)}`
          );
          expect(extractAccountIndexFromDescriptor(descriptor)).toBe(segments[2].index);
          expect(decomposeDescriptor(descriptor)).toEqual({
            descriptor,
            keyOrigin,
            fingerprint,
            derivationPath: `m/${printSegments(segments)}`,
            accountIndex: segments[2].index,
          });
        }
      )
    );
  });

  test('cannot be made from, or read with, an invalid key origin', () => {
    expect(() => createDescriptor("0a3fd8ef/84'/0'", 'xpub')).toThrowError(invalidText);
    expect(() => createDescriptor("0a3fd8ef/84'/0'/0'", 'xp]ub')).toThrowError(RangeError);
    expect(() => createDescriptor("0a3fd8ef/84'/0'/0'", '')).toThrowError(RangeError);
    expect(() => extractKeyOriginPathFromDescriptor("[0a3fd8ef/84'/0']xpub")).toThrowError(
      invalidText
    );
    expect(() => extractKeyFromDescriptor("0a3fd8ef/84'/0'/0'")).toThrowError(invalidText);
  });
});

describe(extractAccountPathFromFullPath.name, () => {
  test('keeps the root and the three account-level segments', () => {
    fc.assert(
      fc.property(rootArbitrary, fullSegmentsArbitrary, (root, segments) => {
        const fullPath = `${root}/${printSegments(segments)}`;
        const accountPath = `${root}/${printSegments(segments.slice(0, 3))}`;
        expect(extractAccountPathFromFullPath(fullPath)).toBe(accountPath);
        expect(extractAccountPathFromFullPath(accountPath)).toBe(accountPath);
      })
    );
  });
});
