import { describe, expect, test } from 'vitest';

import {
  accountKeyOriginPath,
  accountLevelSegments,
  derivationPath,
  descriptorText,
  keyOriginPathOfAnyDepth,
  rootedPath,
} from './derivation-path.kernel';

const accountSegments: [number, boolean][] = [
  [84, true],
  [0, true],
  [7, true],
];

describe('derivation path formats', () => {
  test('a derivation path is m and then segments, hardened ones marked with a quote', () => {
    expect(derivationPath.print([...accountSegments, [1, false], [5, false]])).toBe(
      "m/84'/0'/7'/1/5"
    );
  });

  test('a rooted path keeps whatever root it was given', () => {
    expect(rootedPath.print(['0a3fd8ef', accountSegments])).toBe("0a3fd8ef/84'/0'/7'");
    expect(rootedPath.parse("m/84'/0'/7'")).toEqual(['m', accountSegments]);
  });

  test('a key origin is a fingerprint and then segments', () => {
    expect(keyOriginPathOfAnyDepth.print(['0a3fd8ef', [[86, true]]])).toBe("0a3fd8ef/86'");
    expect(accountKeyOriginPath.print(['0a3fd8ef', accountSegments])).toBe("0a3fd8ef/84'/0'/7'");
  });

  test('an account key origin has at least the three account-level segments', () => {
    expect(accountLevelSegments).toBe(3);
    expect(() => accountKeyOriginPath.parse("0a3fd8ef/84'/0'")).toThrowError(RangeError);
  });

  test('a descriptor is the account key origin in brackets and then the key', () => {
    expect(descriptorText.print([['0a3fd8ef', accountSegments], 'xpub6CUG'])).toBe(
      "[0a3fd8ef/84'/0'/7']xpub6CUG"
    );
  });
});
