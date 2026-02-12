import { describe, expect, it } from 'vitest';

import { CryptoAssetProtocols } from '@leather.io/models';
import { serializeAssetId } from '@leather.io/utils';

import { assetIdToUrlPath, createTokenDetailsPath, urlPathToAssetId } from './token-types';

describe('assetIdToUrlPath', () => {
  it('returns btc for native BTC asset', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' });
    expect(assetIdToUrlPath(assetId)).toBe('btc');
  });

  it('returns stx for native STX asset', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' });
    expect(assetIdToUrlPath(assetId)).toBe('stx');
  });

  it('returns assetName/contractId for SIP-10 tokens', () => {
    const contractId = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';
    const assetName = 'welshcorgicoin';
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.sip10,
      id: `${contractId}::${assetName}`,
    });
    expect(assetIdToUrlPath(assetId)).toBe(`${assetName}/${contractId}`);
  });

  it('returns URL-encoded asset ID for runes', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.rune,
      id: 'UNCOMMON•GOODS',
    });
    expect(assetIdToUrlPath(assetId)).toBe(encodeURIComponent(assetId));
  });
});

describe('urlPathToAssetId', () => {
  it('returns BTC asset ID for btc path', () => {
    const result = urlPathToAssetId('btc');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' }));
  });

  it('returns BTC asset ID for BTC path (case insensitive)', () => {
    const result = urlPathToAssetId('BTC');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' }));
  });

  it('returns STX asset ID for stx path', () => {
    const result = urlPathToAssetId('stx');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' }));
  });

  it('returns STX asset ID for STX path (case insensitive)', () => {
    const result = urlPathToAssetId('STX');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' }));
  });

  it('returns SIP-10 asset ID for assetName/contractId path', () => {
    const contractId = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';
    const assetName = 'welshcorgicoin';
    const result = urlPathToAssetId(`${assetName}/${contractId}`);
    expect(result).toBe(
      serializeAssetId({
        protocol: CryptoAssetProtocols.sip10,
        id: `${contractId}::${assetName}`,
      })
    );
  });

  it('decodes URL-encoded asset ID for other assets', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.rune,
      id: 'UNCOMMON•GOODS',
    });
    const encoded = encodeURIComponent(assetId);
    expect(urlPathToAssetId(encoded)).toBe(assetId);
  });
});

describe('round-trip conversion', () => {
  it('converts SIP-10 asset ID to URL path and back', () => {
    const contractId = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';
    const assetName = 'welshcorgicoin';
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.sip10,
      id: `${contractId}::${assetName}`,
    });
    const urlPath = assetIdToUrlPath(assetId);
    const result = urlPathToAssetId(urlPath);
    expect(result).toBe(assetId);
  });
});

describe('createTokenDetailsPath', () => {
  it('creates correct path for BTC', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' });
    expect(createTokenDetailsPath(assetId)).toBe('/token/btc');
  });

  it('creates correct path for STX', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' });
    expect(createTokenDetailsPath(assetId)).toBe('/token/stx');
  });

  it('creates correct path for SIP-10 tokens', () => {
    const contractId = 'SP123.token-contract';
    const assetName = 'mytoken';
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.sip10,
      id: `${contractId}::${assetName}`,
    });
    expect(createTokenDetailsPath(assetId)).toBe(`/token/${assetName}/${contractId}`);
  });
});
