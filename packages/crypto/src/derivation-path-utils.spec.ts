import {
  extractAccountIndexFromPath,
  extractAddressIndexFromPath,
  extractDerivationPathFromDescriptor,
  extractKeyOriginPathFromDescriptor,
  validateKeyOriginPath,
} from './derivation-path-utils';

describe(extractAddressIndexFromPath.name, () => {
  test('should extract the address index from the derivation path', () => {
    expect(extractAddressIndexFromPath("m/84'/0'/0'/0/0")).toEqual(0);
    expect(extractAddressIndexFromPath("m/84'/0'/0'/0/10")).toEqual(10);
    expect(extractAddressIndexFromPath("m/84'/0'/0'/0/9999")).toEqual(9999);
  });
});

describe(extractAccountIndexFromPath.name, () => {
  test('should extract the account index from a derivation path', () => {
    expect(extractAccountIndexFromPath("m/84'/0'/0'/0/0")).toEqual(0);
    expect(extractAccountIndexFromPath("m/84'/0'/10'/0/0")).toEqual(10);
    expect(extractAccountIndexFromPath("m/84'/0'/9999'/0/0")).toEqual(9999);
  });
});

describe(validateKeyOriginPath.name, () => {
  test('it should return true if the key origin path is valid', () => {
    expect(validateKeyOriginPath("0a3fd8ef/84'/0'/0'")).toEqual(true);
  });

  test('it should throw if the key origin path contains square brackets', () => {
    // This is to catch the case where a full descriptor is passed by mistake
    expect(() => validateKeyOriginPath("[0a3fd8ef/84'/0'/0']xpub")).toThrowError(
      'Key origin path should not contain square brackets'
    );
  });

  test('it should throw if the key origin path does not contain a fingerprint and derivation path', () => {
    // To catch case where a derivation path by itself without a reference to
    // its parent key
    expect(() => validateKeyOriginPath(`m/84'/0'/0'`)).toThrowError(
      'Fingerprint must be a hexadecimal string'
    );
  });

  test('it should throw key origin has less than account level specificity', () => {
    // No where does our design expect a key origin path to be less than account level
    expect(() => validateKeyOriginPath(`0a3fd8ef/84'/0''`)).toThrowError(
      'Key origin path is too short. Should describe at least to the account level'
    );
  });
});

describe(extractDerivationPathFromDescriptor.name, () => {
  test('should extract the derivation path from a descriptor', () => {
    expect(extractDerivationPathFromDescriptor("[0a3fd8ef/84'/0'/0']xpub")).toEqual("m/84'/0'/0'");
  });
});

describe(extractKeyOriginPathFromDescriptor.name, () => {
  test('should extract the key origin path from a descriptor', () => {
    expect(extractKeyOriginPathFromDescriptor("[0a3fd8ef/84'/0'/0']xpub")).toEqual(
      "0a3fd8ef/84'/0'/0'"
    );
  });
});
