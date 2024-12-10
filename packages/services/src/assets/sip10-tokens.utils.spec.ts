import { CryptoAssetCategories, CryptoAssetChains, CryptoAssetProtocols } from '@leather.io/models';

import { HiroFtMetadataResponse } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  createSip10CryptoAssetInfo,
  getAddressFromAssetIdentifier,
  getAssetNameFromIdentifier,
  getContractPrincipalFromAssetIdentifier,
  isTransferableSip10Token,
} from './sip10-tokens.utils';

describe('isTransferableSip10Token', () => {
  let mockTokenMetadata: Partial<HiroFtMetadataResponse>;
  beforeEach(() => {
    mockTokenMetadata = {
      decimals: 6,
      name: 'Mock Token',
      symbol: 'MOCK',
    };
  });
  it('returns false when decimals field is missing', () => {
    delete mockTokenMetadata.decimals;
    expect(isTransferableSip10Token(mockTokenMetadata)).toBe(false);
  });
  it('returns false when name field is missing', () => {
    delete mockTokenMetadata.name;
    expect(isTransferableSip10Token(mockTokenMetadata)).toBe(false);
  });
  it('returns false when symbol field is missing', () => {
    delete mockTokenMetadata.symbol;
    expect(isTransferableSip10Token(mockTokenMetadata)).toBe(false);
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
  let metadata: HiroFtMetadataResponse;

  beforeEach(() => {
    metadata = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 6,
      image_canonical_uri: 'https://test.com/image.png',
      total_supply: '1000000',
    } as HiroFtMetadataResponse;
  });

  it('creates Sip10CryptoAssetInfo instance using provided data', () => {
    const asset = createSip10CryptoAssetInfo(assetIdentifier, metadata);
    expect(asset).toEqual({
      chain: CryptoAssetChains.stacks,
      category: CryptoAssetCategories.fungible,
      protocol: CryptoAssetProtocols.sip10,
      canTransfer: true,
      contractId: 'SP123.token-contract',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://test.com/image.png',
      name: 'Test Token',
      symbol: 'TEST',
    });
  });

  it('uses asset name when metadata name is missing', () => {
    delete metadata.name;
    const result = createSip10CryptoAssetInfo(assetIdentifier, metadata);
    expect(result.name).toBe('TOKEN');
  });
});
