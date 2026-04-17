import { btcAsset, stxAsset } from '@leather.io/constants';
import type { FungibleCryptoAsset, Sip10Asset } from '@leather.io/models';
import {
  type SerializedCryptoAssetId,
  createBaseCryptoAssetBalance,
  createMoney,
} from '@leather.io/utils';

import type { AssetListItem } from './asset-list.types';
import {
  filterAssetsByChain,
  filterAssetsByProtocol,
  filterByDistributionScore,
  filterByHasBalance,
  filterByMarketCap,
  filterByTrendingScore,
  filterByTrustScore,
  paginateItems,
  sortAssetListItems,
} from './asset-list.utils';

const sip10Asset: Sip10Asset = {
  chain: 'stacks',
  category: 'fungible',
  protocol: 'sip10',
  canTransfer: true,
  assetId: 'SP1::token',
  contractId: 'SP1.token',
  decimals: 6,
  hasMemo: true,
  imageCanonicalUri: '',
  name: 'TestToken',
  symbol: 'TT',
};

const allAssets: FungibleCryptoAsset[] = [btcAsset, stxAsset, sip10Asset];

function createTestItem(
  overrides: Partial<AssetListItem> & { id: SerializedCryptoAssetId }
): AssetListItem {
  return overrides as AssetListItem;
}

describe(filterAssetsByProtocol.name, () => {
  test('filters to requested protocols', () => {
    const result = allAssets.filter(filterAssetsByProtocol(['nativeBtc']));
    expect(result).toHaveLength(1);
    expect(result.map(a => a.protocol)).toEqual(['nativeBtc']);
  });

  test('returns all when all protocols requested', () => {
    const result = allAssets.filter(filterAssetsByProtocol(['nativeBtc', 'nativeStx', 'sip10']));
    expect(result).toHaveLength(3);
  });
});

describe(filterAssetsByChain.name, () => {
  test('filters to bitcoin chain', () => {
    const result = allAssets.filter(filterAssetsByChain('bitcoin'));
    expect(result).toHaveLength(1);
    expect(result.every(a => a.chain === 'bitcoin')).toBe(true);
  });

  test('filters to stacks chain', () => {
    const result = allAssets.filter(filterAssetsByChain('stacks'));
    expect(result).toHaveLength(2);
    expect(result.every(a => a.chain === 'stacks')).toBe(true);
  });
});

describe(filterByMarketCap.name, () => {
  const items: AssetListItem[] = [
    createTestItem({ id: 'nativeBtc|BTC', marketStats: { priceChange: {}, marketCap: 1000 } }),
    createTestItem({ id: 'nativeStx|STX', marketStats: { priceChange: {}, marketCap: 500 } }),
    createTestItem({ id: 'sip10|SP1::token', marketStats: { priceChange: {} } }),
  ];

  test('keeps items above threshold', () => {
    const result = items.filter(filterByMarketCap(600));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('nativeBtc|BTC');
  });

  test('excludes items with undefined marketCap', () => {
    const result = items.filter(filterByMarketCap(0));
    expect(result).toHaveLength(2);
  });

  test('returns empty for empty input', () => {
    expect([].filter(filterByMarketCap(100))).toEqual([]);
  });
});

describe(filterByTrustScore.name, () => {
  const items: AssetListItem[] = [
    createTestItem({
      id: 'test|high',
      analytics: { circulatingSupply: 0, trustScore: 80, updatedAt: '' },
    }),
    createTestItem({
      id: 'test|low',
      analytics: { circulatingSupply: 0, trustScore: 40, updatedAt: '' },
    }),
    createTestItem({ id: 'test|none' }),
  ];

  test('keeps items at or above threshold', () => {
    const result = items.filter(filterByTrustScore(50));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test|high');
  });

  test('excludes items without analytics', () => {
    const result = items.filter(filterByTrustScore(0));
    expect(result).toHaveLength(2);
  });
});

describe(filterByTrendingScore.name, () => {
  const items: AssetListItem[] = [
    createTestItem({
      id: 'test|high',
      analytics: { circulatingSupply: 0, trendingScore: 90, updatedAt: '' },
    }),
    createTestItem({
      id: 'test|low',
      analytics: { circulatingSupply: 0, trendingScore: 20, updatedAt: '' },
    }),
  ];

  test('keeps items at or above threshold', () => {
    const result = items.filter(filterByTrendingScore(50));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test|high');
  });
});

describe(filterByDistributionScore.name, () => {
  const items: AssetListItem[] = [
    createTestItem({
      id: 'test|high',
      analytics: { circulatingSupply: 0, distributionScore: 75, updatedAt: '' },
    }),
    createTestItem({
      id: 'test|low',
      analytics: { circulatingSupply: 0, distributionScore: 25, updatedAt: '' },
    }),
    createTestItem({ id: 'test|none' }),
  ];

  test('keeps items at or above threshold', () => {
    const result = items.filter(filterByDistributionScore(50));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test|high');
  });

  test('excludes items without analytics', () => {
    const result = items.filter(filterByDistributionScore(0));
    expect(result).toHaveLength(2);
  });
});

describe(filterByHasBalance.name, () => {
  const items: AssetListItem[] = [
    createTestItem({
      id: 'nativeBtc|BTC',
      balance: {
        crypto: createBaseCryptoAssetBalance(createMoney(100, 'BTC')),
        quote: createBaseCryptoAssetBalance(createMoney(5000, 'USD')),
      },
    }),
    createTestItem({
      id: 'nativeStx|STX',
      balance: {
        crypto: createBaseCryptoAssetBalance(createMoney(0, 'STX')),
        quote: createBaseCryptoAssetBalance(createMoney(0, 'USD')),
      },
    }),
    createTestItem({ id: 'test|none' }),
  ];

  test('keeps only items with non-zero balance', () => {
    const result = items.filter(filterByHasBalance);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('nativeBtc|BTC');
  });

  test('returns empty when no balances exist', () => {
    const noBalanceItems = [createTestItem({ id: 'test|empty' })];
    expect(noBalanceItems.filter(filterByHasBalance)).toHaveLength(0);
  });
});

describe(sortAssetListItems.name, () => {
  const items: AssetListItem[] = [
    createTestItem({
      id: 'nativeBtc|BTC',
      asset: btcAsset,
      marketStats: { priceChange: { '1d': 5 }, marketCap: 1000 },
      analytics: {
        circulatingSupply: 0,
        trustScore: 80,
        trendingScore: 30,
        distributionScore: 50,
        updatedAt: '',
      },
      balance: {
        crypto: createBaseCryptoAssetBalance(createMoney(200, 'BTC')),
        quote: createBaseCryptoAssetBalance(createMoney(10000, 'USD')),
      },
    }),
    createTestItem({
      id: 'nativeStx|STX',
      asset: stxAsset,
      marketStats: { priceChange: { '1d': -2 }, marketCap: 500 },
      analytics: {
        circulatingSupply: 0,
        trustScore: 60,
        trendingScore: 90,
        distributionScore: 70,
        updatedAt: '',
      },
      balance: {
        crypto: createBaseCryptoAssetBalance(createMoney(1000, 'STX')),
        quote: createBaseCryptoAssetBalance(createMoney(2000, 'USD')),
      },
    }),
  ];

  test('sorts by name ascending', () => {
    const result = sortAssetListItems(items, [{ field: 'name', direction: 'asc' }]);
    expect(result[0].id).toBe('nativeBtc|BTC');
    expect(result[1].id).toBe('nativeStx|STX');
  });

  test('sorts by name descending', () => {
    const result = sortAssetListItems(items, [{ field: 'name', direction: 'desc' }]);
    expect(result[0].id).toBe('nativeStx|STX');
    expect(result[1].id).toBe('nativeBtc|BTC');
  });

  test('sorts by marketCap descending', () => {
    const result = sortAssetListItems(items, [{ field: 'marketCap', direction: 'desc' }]);
    expect(result[0].id).toBe('nativeBtc|BTC');
  });

  test('sorts by quoteTotalBalance ascending', () => {
    const result = sortAssetListItems(items, [{ field: 'quoteTotalBalance', direction: 'asc' }]);
    expect(result[0].id).toBe('nativeStx|STX');
  });

  test('sorts by quoteAvailableBalance ascending', () => {
    const result = sortAssetListItems(items, [
      { field: 'quoteAvailableBalance', direction: 'asc' },
    ]);
    expect(result[0].id).toBe('nativeStx|STX');
  });

  test('sorts by change1d descending', () => {
    const result = sortAssetListItems(items, [{ field: 'change1d', direction: 'desc' }]);
    expect(result[0].id).toBe('nativeBtc|BTC');
  });

  test('sorts by trustScore descending', () => {
    const result = sortAssetListItems(items, [{ field: 'trustScore', direction: 'desc' }]);
    expect(result[0].id).toBe('nativeBtc|BTC');
  });

  test('sorts by trendingScore descending', () => {
    const result = sortAssetListItems(items, [{ field: 'trendingScore', direction: 'desc' }]);
    expect(result[0].id).toBe('nativeStx|STX');
  });

  test('sorts by distributionScore ascending', () => {
    const result = sortAssetListItems(items, [{ field: 'distributionScore', direction: 'asc' }]);
    expect(result[0].id).toBe('nativeBtc|BTC');
  });

  test('uses secondary sort field as tiebreaker', () => {
    const tieItems: AssetListItem[] = [
      createTestItem({
        id: 'test|a',
        analytics: { circulatingSupply: 0, trustScore: 80, trendingScore: 10, updatedAt: '' },
        balance: {
          crypto: createBaseCryptoAssetBalance(createMoney(0, 'BTC')),
          quote: createBaseCryptoAssetBalance(createMoney(0, 'USD')),
        },
      }),
      createTestItem({
        id: 'test|b',
        analytics: { circulatingSupply: 0, trustScore: 60, trendingScore: 10, updatedAt: '' },
        balance: {
          crypto: createBaseCryptoAssetBalance(createMoney(0, 'BTC')),
          quote: createBaseCryptoAssetBalance(createMoney(0, 'USD')),
        },
      }),
      createTestItem({
        id: 'test|c',
        analytics: { circulatingSupply: 0, trustScore: 90, trendingScore: 50, updatedAt: '' },
        balance: {
          crypto: createBaseCryptoAssetBalance(createMoney(500, 'BTC')),
          quote: createBaseCryptoAssetBalance(createMoney(500, 'USD')),
        },
      }),
    ];
    const result = sortAssetListItems(tieItems, [
      { field: 'quoteTotalBalance', direction: 'desc' },
      { field: 'trustScore', direction: 'desc' },
    ]);
    expect(result[0].id).toBe('test|c');
    expect(result[1].id).toBe('test|a');
    expect(result[2].id).toBe('test|b');
  });

  test('does not mutate original array', () => {
    const original = [...items];
    sortAssetListItems(items, [{ field: 'marketCap', direction: 'desc' }]);
    expect(items).toEqual(original);
  });
});

describe(paginateItems.name, () => {
  const items: AssetListItem[] = Array.from({ length: 5 }, (_, i) =>
    createTestItem({ id: `test|item-${i}` })
  );

  test('applies offset and limit', () => {
    const result = paginateItems(items, { offset: 1, limit: 2 });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('test|item-1');
    expect(result[1].id).toBe('test|item-2');
  });

  test('returns remaining items when limit exceeds length', () => {
    const result = paginateItems(items, { offset: 3, limit: 10 });
    expect(result).toHaveLength(2);
  });

  test('returns empty for offset beyond length', () => {
    const result = paginateItems(items, { offset: 10, limit: 5 });
    expect(result).toHaveLength(0);
  });

  test('returns all items with zero offset and large limit', () => {
    const result = paginateItems(items, { offset: 0, limit: 100 });
    expect(result).toHaveLength(5);
  });
});
