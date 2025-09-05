import { RuneAsset, Sip10Asset } from '@leather.io/models';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { AccountRequestFilteringOptions } from '../types';
import { filterUsingAssetVisibility } from './filtering';

const sip10Asset1: Sip10Asset = {
  category: 'fungible',
  name: 'Test Token',
  symbol: 'TEST1',
  decimals: 6,
  assetId: 'SP000...TEST1',
  contractId: 'SP000...TEST1',
  chain: 'stacks',
  protocol: 'sip10',
  canTransfer: true,
  imageCanonicalUri: '',
  hasMemo: false,
};
const sip10Asset2: Sip10Asset = {
  category: 'fungible',
  name: 'Test Token',
  symbol: 'TEST2',
  decimals: 6,
  assetId: 'SP000...TEST2',
  contractId: 'SP000...TEST2',
  chain: 'stacks',
  protocol: 'sip10',
  canTransfer: true,
  imageCanonicalUri: '',
  hasMemo: false,
};
const sip10Asset3: Sip10Asset = {
  category: 'fungible',
  name: 'Test Token',
  symbol: 'TEST3',
  decimals: 6,
  assetId: 'SP000...TEST3',
  contractId: 'SP000...TEST3',
  chain: 'stacks',
  protocol: 'sip10',
  canTransfer: true,
  imageCanonicalUri: '',
  hasMemo: false,
};
const runeAsset1: RuneAsset = {
  category: 'fungible',
  chain: 'bitcoin',
  protocol: 'rune',
  symbol: '👽',
  runeName: 'TEST1',
  spacedRuneName: 'TE•ST',
  decimals: 6,
  hasMemo: false,
};
const runeAsset2: RuneAsset = {
  category: 'fungible',
  chain: 'bitcoin',
  protocol: 'rune',
  symbol: '👽',
  runeName: 'TEST2',
  spacedRuneName: 'TE•ST',
  decimals: 6,
  hasMemo: false,
};
const runeAsset3: RuneAsset = {
  category: 'fungible',
  chain: 'bitcoin',
  protocol: 'rune',
  symbol: '👽',
  runeName: 'TEST3',
  spacedRuneName: 'TE•ST',
  decimals: 6,
  hasMemo: false,
};

const sip10s = [sip10Asset1, sip10Asset2, sip10Asset3];
const runes = [runeAsset1, runeAsset2, runeAsset3];
const allAssets = [...sip10s, ...runes];

const assetVisibility: AccountRequestFilteringOptions['assetVisibility'] = {};
assetVisibility[serializeAssetId(getAssetId(sip10Asset1))] = true;
assetVisibility[serializeAssetId(getAssetId(sip10Asset2))] = false;
assetVisibility[serializeAssetId(getAssetId(runeAsset2))] = true;
assetVisibility[serializeAssetId(getAssetId(runeAsset1))] = false;

const emptyAssetVisibility: AccountRequestFilteringOptions['assetVisibility'] = {};

describe('filterUsingAssetVisibility', () => {
  it('should filter out assets based on sip10 assetId', () => {
    const result = sip10s.filter(sip10 => filterUsingAssetVisibility(sip10, assetVisibility));

    expect(result.length).toBe(2);
    expect(serializeAssetId(getAssetId(result[0]))).toBe('sip10|SP000...TEST1');
    expect(serializeAssetId(getAssetId(result[1]))).toBe('sip10|SP000...TEST3');
  });
  it('should filter out assets based on runes runeName', () => {
    const result = runes.filter(rune => filterUsingAssetVisibility(rune, assetVisibility));

    expect(result.length).toBe(2);
    expect(serializeAssetId(getAssetId(result[0]))).toBe('rune|TEST2');
    expect(serializeAssetId(getAssetId(result[1]))).toBe('rune|TEST3');
  });
  it('should filter out assets based on runes runeName (empty assetVisibility)', () => {
    const result = runes.filter(rune => filterUsingAssetVisibility(rune, emptyAssetVisibility));

    expect(result.length).toBe(3);
    expect(serializeAssetId(getAssetId(result[0]))).toBe('rune|TEST1');
    expect(serializeAssetId(getAssetId(result[1]))).toBe('rune|TEST2');
    expect(serializeAssetId(getAssetId(result[2]))).toBe('rune|TEST3');
  });
  it('should filter out assets both sip10s and runes together', () => {
    const result = allAssets.filter(rune => filterUsingAssetVisibility(rune, assetVisibility));

    expect(result.length).toBe(4);
    expect(serializeAssetId(getAssetId(result[0]))).toBe('sip10|SP000...TEST1');
    expect(serializeAssetId(getAssetId(result[1]))).toBe('sip10|SP000...TEST3');
    expect(serializeAssetId(getAssetId(result[2]))).toBe('rune|TEST2');
    expect(serializeAssetId(getAssetId(result[3]))).toBe('rune|TEST3');
  });
});
