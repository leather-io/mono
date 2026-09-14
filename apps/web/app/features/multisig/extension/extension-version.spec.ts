import { describe, expect, test, vi } from 'vitest';

import {
  isExtensionVersionSupported,
  minSupportedExtensionVersion,
  parseExtensionVersion,
  readExtensionVersion,
} from './extension-version';

describe('parseExtensionVersion', () => {
  test('parses a release version', () => {
    expect(parseExtensionVersion('6.112.0')).toEqual({ major: 6, minor: 112, patch: 0 });
  });

  test('ignores the random suffix of non-release builds', () => {
    expect(parseExtensionVersion('6.111.0.512')).toEqual({ major: 6, minor: 111, patch: 0 });
  });

  test('ignores a prerelease suffix', () => {
    expect(parseExtensionVersion('6.112.0-beta.1')).toEqual({ major: 6, minor: 112, patch: 0 });
  });

  test('returns null for unparsable input', () => {
    expect(parseExtensionVersion('replace_version')).toBeNull();
    expect(parseExtensionVersion('')).toBeNull();
    expect(parseExtensionVersion('6.112')).toBeNull();
  });
});

describe('isExtensionVersionSupported', () => {
  test('minimum version is 6.112.0', () => {
    expect(minSupportedExtensionVersion).toBe('6.112.0');
  });

  test('refuses older versions', () => {
    expect(isExtensionVersionSupported('6.111.0')).toBe(false);
    expect(isExtensionVersionSupported('6.111.9')).toBe(false);
    expect(isExtensionVersionSupported('5.999.0')).toBe(false);
    expect(isExtensionVersionSupported('6.111.0.512')).toBe(false);
  });

  test('accepts the minimum version and newer', () => {
    expect(isExtensionVersionSupported('6.112.0')).toBe(true);
    expect(isExtensionVersionSupported('6.112.1')).toBe(true);
    expect(isExtensionVersionSupported('6.113.0')).toBe(true);
    expect(isExtensionVersionSupported('7.0.0')).toBe(true);
    expect(isExtensionVersionSupported('6.112.0.42')).toBe(true);
  });

  test('accepts unparsable versions', () => {
    expect(isExtensionVersionSupported('replace_version')).toBe(true);
  });
});

describe('readExtensionVersion', () => {
  test('reads the version from getProductInfo', () => {
    const provider = { getProductInfo: () => ({ version: '6.112.0', name: 'Leather' }) };
    expect(readExtensionVersion(provider)).toBe('6.112.0');
  });

  test('returns null when the provider is missing or has no getProductInfo', () => {
    expect(readExtensionVersion(undefined)).toBeNull();
    expect(readExtensionVersion(null)).toBeNull();
    expect(readExtensionVersion({ request: vi.fn() })).toBeNull();
  });

  test('returns null when the product info is malformed', () => {
    expect(readExtensionVersion({ getProductInfo: () => null })).toBeNull();
    expect(readExtensionVersion({ getProductInfo: () => ({ version: 42 }) })).toBeNull();
    expect(readExtensionVersion({ getProductInfo: () => ({ name: 'Leather' }) })).toBeNull();
  });

  test('returns null when getProductInfo throws', () => {
    const provider = {
      getProductInfo() {
        throw new Error('boom');
      },
    };
    expect(readExtensionVersion(provider)).toBeNull();
  });
});
