import { CryptoAssetCategories, CryptoAssetChains, CryptoAssetProtocols } from '@leather.io/models';
import { getSip10TokenNameWithOverrides } from '@leather.io/utils';

import { LeatherApiSip10Token } from '../infrastructure/api/leather/leather-api.client';
import {
  createSip10Asset,
  getAddressFromAssetIdentifier,
  getAssetNameFromIdentifier,
  getContractPrincipalFromAssetIdentifier,
  isTransferableSip10Token,
} from './stacks-asset.utils';

describe('isTransferableSip10Token', () => {
  let mockTokenMetadata: LeatherApiSip10Token;
  beforeEach(() => {
    mockTokenMetadata = {
      decimals: 6,
      name: 'Mock Token',
      symbol: 'MOCK',
      assetIdentifier: 'assetIdentifier',
      image: 'image',
      principal: 'principal',
    };
  });
  it('returns true when metadata all required fields are defined', () => {
    expect(isTransferableSip10Token(mockTokenMetadata)).toBe(true);
  });
});

const mockAssetIdentifier = 'SP123.token-contract::TOKEN';

describe('getAssetNameFromIdentifier', () => {
  it('returns asset name from identifier with separator', () => {
    expect(getAssetNameFromIdentifier(mockAssetIdentifier)).toBe('TOKEN');
  });
  it('returns full identifier when no separator exists', () => {
    expect(getAssetNameFromIdentifier('TOKEN')).toBe('TOKEN');
  });
});

describe('getContractPrincipalFromAssetIdentifier', () => {
  it('returns contract principal from asset identifier', () => {
    expect(getContractPrincipalFromAssetIdentifier(mockAssetIdentifier)).toBe(
      'SP123.token-contract'
    );
  });
});

describe('getAddressFromAssetIdentifier', () => {
  it('returns address from asset identifier', () => {
    expect(getAddressFromAssetIdentifier(mockAssetIdentifier)).toBe('SP123');
  });
});

describe('getSip10TokenNameWithOverrides', () => {
  it('returns override name for known contract principal', () => {
    expect(
      getSip10TokenNameWithOverrides(
        'SPQYMRAKZPQPJAADX5JBEFT0FHE3RZZK9F8TYBQ3.dawgpool-stxcity',
        'dawgpool'
      )
    ).toBe('Dawgcoin');
  });

  it('returns fallback name for unknown contract principal', () => {
    expect(getSip10TokenNameWithOverrides('SP123.unknown-token', 'Original Name')).toBe(
      'Original Name'
    );
  });
});

describe('createSip10Asset', () => {
  const assetIdentifier = 'SP123.token-contract::TOKEN';
  let sip10Token: LeatherApiSip10Token;

  beforeEach(() => {
    sip10Token = {
      assetIdentifier,
      name: 'Test Token',
      symbol: 'TEST',
      principal: 'SP123.token-contract',
      decimals: 6,
      image: 'https://test.com/image.png',
    };
  });

  it('creates Sip10Asset instance using provided data', () => {
    const asset = createSip10Asset(sip10Token);
    expect(asset).toEqual({
      chain: CryptoAssetChains.stacks,
      category: CryptoAssetCategories.fungible,
      protocol: CryptoAssetProtocols.sip10,
      canTransfer: true,
      assetId: assetIdentifier,
      contractId: 'SP123.token-contract',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://test.com/image.png',
      name: 'Test Token',
      symbol: 'TEST',
    });
  });

  it('uses override name when contract principal has an override', () => {
    sip10Token.principal = 'SPQYMRAKZPQPJAADX5JBEFT0FHE3RZZK9F8TYBQ3.dawgpool-stxcity';
    const asset = createSip10Asset(sip10Token);
    expect(asset.name).toBe('Dawgcoin');
  });

  it('derives symbol from override name when override is applied', () => {
    sip10Token.principal = 'SPQYMRAKZPQPJAADX5JBEFT0FHE3RZZK9F8TYBQ3.dawgpool-stxcity';
    sip10Token.symbol = '';
    const asset = createSip10Asset(sip10Token);
    expect(asset.name).toBe('Dawgcoin');
    expect(asset.symbol).toBe('DA');
  });

  it('falls back to asset name when token name is undefined', () => {
    // @ts-expect-error -- testing runtime fallback when API returns missing name
    delete sip10Token.name;
    const asset = createSip10Asset(sip10Token);
    expect(asset.name).toBe('TOKEN');
  });
});
