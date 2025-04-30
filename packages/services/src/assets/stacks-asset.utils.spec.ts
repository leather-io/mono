import { CryptoAssetCategories, CryptoAssetChains, CryptoAssetProtocols } from '@leather.io/models';

import { LeatherApiSip10Token } from '../infrastructure/api/leather/leather-api.client';
import {
  createSip10CryptoAssetInfo,
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

describe('createSip10CryptoAssetInfo', () => {
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

  it('creates Sip10CryptoAssetInfo instance using provided data', () => {
    const asset = createSip10CryptoAssetInfo(sip10Token);
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
});
