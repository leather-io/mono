import { describe, expect, test } from 'vitest';

import {
  accountDerivationPath,
  accountKeyOriginPath,
  accountLevelPath,
  derivationPath,
  descriptorText,
  keyOriginPathFromSegments,
  keyOriginPathOfAnyDepth,
  pathToAccount,
  pathToAddressIndex,
  pathToChange,
  pathToPurpose,
} from './derivation-path.kernel';

const fullPath = "m/84'/1'/7'/2/5";

describe('derivation path formats', () => {
  test('a path names its purpose and keeps what follows', () => {
    expect(pathToPurpose.parse(fullPath)).toEqual({
      root: 'm',
      purpose: [84, true],
      rest: [
        [1, true],
        [7, true],
        [2, false],
        [5, false],
      ],
    });
    expect(pathToPurpose.parse("0a3fd8ef/84'")).toEqual({
      root: '0a3fd8ef',
      purpose: [84, true],
      rest: [],
    });
  });

  test('a path names purpose, coin type and account', () => {
    expect(pathToAccount.parse(fullPath)).toEqual({
      root: 'm',
      purpose: [84, true],
      coinType: [1, true],
      account: [7, true],
      rest: [
        [2, false],
        [5, false],
      ],
    });
    expect(() => pathToAccount.parse("m/84'/1'")).toThrowError(RangeError);
  });

  test('a path names its change index as the fourth segment', () => {
    expect(pathToChange.parse(fullPath)).toMatchObject({
      account: [7, true],
      change: [2, false],
      rest: [[5, false]],
    });
    expect(() => pathToChange.parse("m/84'/1'/7'")).toThrowError(RangeError);
  });

  test('a path names its address index as the fifth segment', () => {
    expect(pathToAddressIndex.parse(fullPath)).toMatchObject({
      change: [2, false],
      addressIndex: [5, false],
      rest: [],
    });
    expect(() => pathToAddressIndex.parse("m/84'/1'/7'/2")).toThrowError(RangeError);
  });

  test('an account-level path has exactly three segments', () => {
    expect(
      accountLevelPath.print({
        root: '0a3fd8ef',
        purpose: [84, true],
        coinType: [1, true],
        account: [7, true],
      })
    ).toBe("0a3fd8ef/84'/1'/7'");
    expect(() => accountLevelPath.parse(fullPath)).toThrowError(RangeError);
  });

  test('a derivation path starts with m', () => {
    expect(derivationPath.print([[84, true], [[1, true]]])).toBe("m/84'/1'");
    expect(
      accountDerivationPath.print({
        purpose: [84, true],
        coinType: [1, true],
        account: [7, true],
        rest: [],
      })
    ).toBe("m/84'/1'/7'");
    expect(() => derivationPath.parse("84'/1'")).toThrowError(RangeError);
  });

  test('a key origin starts with a fingerprint of up to eight lower-case hex characters', () => {
    expect(keyOriginPathOfAnyDepth.print({ fingerprint: '0a3fd8ef', path: [[86, true], []] })).toBe(
      "0a3fd8ef/86'"
    );
    expect(
      keyOriginPathFromSegments.print({
        fingerprint: '0a3fd8ef',
        segments: [
          [86, true],
          [0, false],
        ],
      })
    ).toBe("0a3fd8ef/86'/0");
    expect(keyOriginPathOfAnyDepth.parse("f25e8/44'").fingerprint).toBe('f25e8');
    expect(() => keyOriginPathOfAnyDepth.parse("0A3FD8EF/86'")).toThrowError(RangeError);
    expect(() => keyOriginPathOfAnyDepth.parse("0a3fd8ef0/86'")).toThrowError(RangeError);
  });

  test('an account key origin reaches at least the account level', () => {
    expect(accountKeyOriginPath.parse("0a3fd8ef/84'/1'/7'")).toEqual({
      fingerprint: '0a3fd8ef',
      path: { purpose: [84, true], coinType: [1, true], account: [7, true], rest: [] },
    });
    expect(() => accountKeyOriginPath.parse("0a3fd8ef/84'/1'")).toThrowError(RangeError);
  });

  test('a descriptor is the account key origin in brackets and then a key without brackets', () => {
    expect(descriptorText.parse("[0a3fd8ef/84'/1'/7']xpub6CUG")).toEqual({
      keyOrigin: {
        fingerprint: '0a3fd8ef',
        path: { purpose: [84, true], coinType: [1, true], account: [7, true], rest: [] },
      },
      key: 'xpub6CUG',
    });
    expect(() => descriptorText.parse("0a3fd8ef/84'/1'/7'xpub6CUG")).toThrowError(RangeError);
    expect(() => descriptorText.parse("[0a3fd8ef/84'/1'/7']")).toThrowError(RangeError);
    expect(() => descriptorText.parse("[0a3fd8ef/84'/1'/7']xp]ub")).toThrowError(RangeError);
  });
});
