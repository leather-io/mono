import { featureFlagKeys, parseFlagOverrides } from './feature-flags';
import { VerifyUsageError } from './verify-errors';

describe('parseFlagOverrides', () => {
  test('parses boolean overrides for known keys', () => {
    expect(parseFlagOverrides(['releaseOnramperBuy=false', 'assetsRevamp=true'])).toEqual({
      releaseOnramperBuy: false,
      assetsRevamp: true,
    });
  });

  test('rejects an unknown key naming the known ones', () => {
    expect(() => parseFlagOverrides(['releaseNothing=true'])).toThrow(featureFlagKeys[0]);
  });

  test('rejects a value that is not true or false', () => {
    expect(() => parseFlagOverrides(['releaseOnramperBuy=yes'])).toThrow(VerifyUsageError);
  });

  test('rejects a pair without a key', () => {
    expect(() => parseFlagOverrides(['=true'])).toThrow(VerifyUsageError);
  });
});
