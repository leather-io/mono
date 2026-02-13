import { describe, expect, it } from 'vitest';

import { CryptoAssetProtocols } from '@leather.io/models';
import { serializeAssetId } from '@leather.io/utils';

import { createTokenDetailsPath, urlPathToAssetId } from './token-url';

describe('urlPathToAssetId', () => {
  it('handles BTC native asset', () => {
    const result = urlPathToAssetId('BTC');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' }));
  });

  it('handles STX native asset', () => {
    const result = urlPathToAssetId('STX');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' }));
  });

  it('handles inscription asset', () => {
    const result = urlPathToAssetId('inscription/abc123');
    expect(result).toBe(serializeAssetId({ protocol: 'inscription', id: 'abc123' }));
  });

  it('handles sip9 asset with encoded characters', () => {
    const result = urlPathToAssetId('sip9/SP123.contract%3A%3Atoken');
    expect(result).toBe(serializeAssetId({ protocol: 'sip9', id: 'SP123.contract::token' }));
  });

  it('throws error for invalid path without slash', () => {
    expect(() => urlPathToAssetId('invalid')).toThrow('Invalid asset URL path: invalid');
  });
});

describe('createTokenDetailsPath', () => {
  it('creates path for BTC native asset', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' });
    expect(createTokenDetailsPath(assetId)).toBe('/token/BTC');
  });

  it('creates path for STX native asset', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' });
    expect(createTokenDetailsPath(assetId)).toBe('/token/STX');
  });

  it('creates path for inscription asset', () => {
    const assetId = serializeAssetId({ protocol: 'inscription', id: 'abc123' });
    expect(createTokenDetailsPath(assetId)).toBe('/token/inscription/abc123');
  });

  it('encodes special characters in asset id', () => {
    const assetId = serializeAssetId({ protocol: 'sip9', id: 'SP123.contract::token' });
    expect(createTokenDetailsPath(assetId)).toBe('/token/sip9/SP123.contract%3A%3Atoken');
  });
});
