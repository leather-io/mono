import { describe, expect, it } from 'vitest';

import { CryptoAssetProtocols } from '@leather.io/models';
import { serializeAssetId } from '@leather.io/utils';

import { urlPathToAssetId } from './token-url';

describe('urlPathToAssetId', () => {
  it('handles BTC native asset', () => {
    const result = urlPathToAssetId('BTC');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' }));
  });

  it('handles STX native asset', () => {
    const result = urlPathToAssetId('STX');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' }));
  });

  it('handles sip9 asset with encoded characters', () => {
    const result = urlPathToAssetId('sip9/SP123.contract%3A%3Atoken');
    expect(result).toBe(serializeAssetId({ protocol: 'sip9', id: 'SP123.contract::token' }));
  });

  it('throws error for invalid path without slash', () => {
    expect(() => urlPathToAssetId('invalid')).toThrow('Invalid asset URL path: invalid');
  });
});
