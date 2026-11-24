import { describe, expect, test } from 'vitest';

import {
  appendAddressIndexToPath,
  createDescriptor,
  createKeyOriginPath,
  createKeyOriginPathFromSegments,
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
const fullPath = "m/84'/1'/7'/2/5";
const fullKeyOrigin = "0a3fd8ef/84'/1'/7'/2/5";
const accountKeyOrigin = "0a3fd8ef/84'/1'/7'";
const descriptor = "[0a3fd8ef/84'/1'/7']xpub6CUG";

describe('path segment extractors', () => {
  test('each read their own segment, under either kind of root', () => {
    for (const path of [fullPath, fullKeyOrigin]) {
      expect(extractPurposeFromPath(path)).toBe(84);
      expect(extractAccountIndexFromPath(path)).toBe(7);
      expect(extractChangeIndexFromPath(path)).toBe(2);
      expect(extractAddressIndexFromPath(path)).toBe(5);
    }
  });

  test('throw for a path that stops before their segment', () => {
    expect(() => extractAccountIndexFromPath("m/84'/1'")).toThrowError(invalidText);
    expect(() => extractChangeIndexFromPath("m/84'/1'/7'")).toThrowError(invalidText);
    expect(() => extractAddressIndexFromPath("m/84'/1'/7'/2")).toThrowError(invalidText);
  });

  test('throw for a descriptor passed by mistake', () => {
    expect(() => extractAccountIndexFromPath(descriptor)).toThrowError(invalidText);
  });
});

describe(appendAddressIndexToPath.name, () => {
  test('appends the change and then the address index', () => {
    expect(appendAddressIndexToPath(accountKeyOrigin, 2, 5)).toBe(fullKeyOrigin);
    expect(appendAddressIndexToPath("m/84'/1'/7'", 0, 12)).toBe("m/84'/1'/7'/0/12");
  });

  test('throws for a path with no account level', () => {
    expect(() => appendAddressIndexToPath("m/84'/1'", 0, 0)).toThrowError(invalidText);
  });
});

describe('key origin paths', () => {
  test('swap the root of a derivation path for the fingerprint, and back', () => {
    expect(createKeyOriginPath('0a3fd8ef', fullPath)).toBe(fullKeyOrigin);
    expect(keyOriginToDerivationPath(fullKeyOrigin)).toBe(fullPath);
    expect(extractFingerprintFromKeyOriginPath(fullKeyOrigin)).toBe('0a3fd8ef');
  });

  test('are built from numbered segments', () => {
    expect(
      createKeyOriginPathFromSegments('0a3fd8ef', [
        [84, true],
        [1, true],
        [7, true],
      ])
    ).toBe(accountKeyOrigin);
  });

  test('take a derivation path only with its m root', () => {
    expect(() => createKeyOriginPath('0a3fd8ef', "84'/1'/7'")).toThrowError(invalidText);
  });

  test('are valid from the account level down, and not as a bare derivation path', () => {
    expect(validateKeyOriginPath(accountKeyOrigin)).toBe(true);
    expect(validateKeyOriginPath(fullKeyOrigin)).toBe(true);
    expect(() => validateKeyOriginPath("m/84'/1'/7'")).toThrowError(invalidText);
    expect(() => validateKeyOriginPath("0a3fd8ef/84'/1'")).toThrowError(invalidText);
  });

  test('accept the short fingerprints that older builds saved without padding', () => {
    expect(extractFingerprintFromKeyOriginPath("f25e8/44'/5757'/0'/0/0")).toBe('f25e8');
  });
});

describe('descriptors', () => {
  test('are made from a key origin and a key', () => {
    expect(createDescriptor(accountKeyOrigin, 'xpub6CUG')).toBe(descriptor);
  });

  test('give back each part that went into them', () => {
    expect(extractKeyOriginPathFromDescriptor(descriptor)).toBe(accountKeyOrigin);
    expect(extractKeyFromDescriptor(descriptor)).toBe('xpub6CUG');
    expect(extractFingerprintFromDescriptor(descriptor)).toBe('0a3fd8ef');
    expect(extractDerivationPathFromDescriptor(descriptor)).toBe("m/84'/1'/7'");
    expect(extractAccountIndexFromDescriptor(descriptor)).toBe(7);
    expect(decomposeDescriptor(descriptor)).toEqual({
      descriptor,
      keyOrigin: accountKeyOrigin,
      fingerprint: '0a3fd8ef',
      derivationPath: "m/84'/1'/7'",
      accountIndex: 7,
    });
  });

  test('keep a key origin that goes below the account level', () => {
    const stacksDescriptor = "[0a3fd8ef/44'/5757'/0'/0/3]03ab";
    expect(extractKeyOriginPathFromDescriptor(stacksDescriptor)).toBe("0a3fd8ef/44'/5757'/0'/0/3");
    expect(extractDerivationPathFromDescriptor(stacksDescriptor)).toBe("m/44'/5757'/0'/0/3");
    expect(extractAccountIndexFromDescriptor(stacksDescriptor)).toBe(0);
  });

  test('cannot be made from, or read with, an invalid key origin', () => {
    expect(() => createDescriptor("0a3fd8ef/84'/1'", 'xpub')).toThrowError(invalidText);
    expect(() => extractKeyFromDescriptor(accountKeyOrigin)).toThrowError(invalidText);
  });
});

describe(extractAccountPathFromFullPath.name, () => {
  test('keeps the root and the three account-level segments', () => {
    expect(extractAccountPathFromFullPath(fullKeyOrigin)).toBe(accountKeyOrigin);
    expect(extractAccountPathFromFullPath(fullPath)).toBe("m/84'/1'/7'");
    expect(extractAccountPathFromFullPath(accountKeyOrigin)).toBe(accountKeyOrigin);
  });
});
