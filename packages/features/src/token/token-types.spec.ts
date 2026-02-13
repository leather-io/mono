import { describe, expect, it } from 'vitest';

import { CryptoAssetProtocols } from '@leather.io/models';
import { serializeAssetId } from '@leather.io/utils';

import { createTokenDetailsPath, parseTokenDetailsAssetId } from './token-types';

describe('createTokenDetailsPath', () => {
  it('creates friendly path for BTC', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' });
    expect(createTokenDetailsPath(assetId)).toBe('/token/btc');
  });

  it('creates friendly path for STX', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' });
    expect(createTokenDetailsPath(assetId)).toBe('/token/stx');
  });

  it('creates URL-encoded path for SIP-10 tokens', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.sip10,
      id: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin',
    });
    const path = createTokenDetailsPath(assetId);
    expect(path).toBe(`/token/${encodeURIComponent(assetId)}`);
  });

  it('creates URL-encoded path for runes', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.rune,
      id: 'UNCOMMON•GOODS',
    });
    const path = createTokenDetailsPath(assetId);
    expect(path).toBe(`/token/${encodeURIComponent(assetId)}`);
  });
});

describe('parseTokenDetailsAssetId', () => {
  it('returns null for undefined input', () => {
    expect(parseTokenDetailsAssetId(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseTokenDetailsAssetId('')).toBeNull();
  });

  it('parses btc path to BTC asset ID', () => {
    const result = parseTokenDetailsAssetId('btc');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' }));
  });

  it('parses BTC path case insensitively', () => {
    const result = parseTokenDetailsAssetId('BTC');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' }));
  });

  it('parses stx path to STX asset ID', () => {
    const result = parseTokenDetailsAssetId('stx');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' }));
  });

  it('parses STX path case insensitively', () => {
    const result = parseTokenDetailsAssetId('STX');
    expect(result).toBe(serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' }));
  });

  it('parses URL-encoded SIP-10 asset ID', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.sip10,
      id: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin',
    });
    const encoded = encodeURIComponent(assetId);
    expect(parseTokenDetailsAssetId(encoded)).toBe(assetId);
  });

  it('parses URL-encoded rune asset ID', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.rune,
      id: 'UNCOMMON•GOODS',
    });
    const encoded = encodeURIComponent(assetId);
    expect(parseTokenDetailsAssetId(encoded)).toBe(assetId);
  });

  it('returns null for invalid asset ID format', () => {
    expect(parseTokenDetailsAssetId('invalid-asset-id')).toBeNull();
  });
});

describe('round-trip conversion', () => {
  it('creates path and parses back for BTC', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeBtc, id: 'BTC' });
    const path = createTokenDetailsPath(assetId);
    expect(path).toBe('/token/btc');
    const encodedPart = path.replace('/token/', '');
    expect(parseTokenDetailsAssetId(encodedPart)).toBe(assetId);
  });

  it('creates path and parses back for STX', () => {
    const assetId = serializeAssetId({ protocol: CryptoAssetProtocols.nativeStx, id: 'STX' });
    const path = createTokenDetailsPath(assetId);
    expect(path).toBe('/token/stx');
    const encodedPart = path.replace('/token/', '');
    expect(parseTokenDetailsAssetId(encodedPart)).toBe(assetId);
  });

  it('creates path and parses back for SIP-10', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.sip10,
      id: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token',
    });
    const path = createTokenDetailsPath(assetId);
    const encodedPart = path.replace('/token/', '');
    expect(parseTokenDetailsAssetId(encodedPart)).toBe(assetId);
  });

  it('creates path and parses back for sBTC', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.sip10,
      id: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
    });
    const path = createTokenDetailsPath(assetId);
    const encodedPart = path.replace('/token/', '');
    expect(parseTokenDetailsAssetId(encodedPart)).toBe(assetId);
  });

  it('creates path and parses back for runes with special characters', () => {
    const assetId = serializeAssetId({
      protocol: CryptoAssetProtocols.rune,
      id: 'UNCOMMON•GOODS',
    });
    const path = createTokenDetailsPath(assetId);
    const encodedPart = path.replace('/token/', '');
    expect(parseTokenDetailsAssetId(encodedPart)).toBe(assetId);
  });
});
