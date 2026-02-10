import 'reflect-metadata';

import { Container } from 'inversify';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defaultCurrentNetwork } from '@leather.io/models';
import { HttpCacheService } from '@leather.io/services';

function loadEnv() {
  try {
    const envPath = resolve(new URL('.', import.meta.url).pathname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^(\w+)=['"](.*)['"]\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {}
}
loadEnv();

const Types = {
  Environment: Symbol.for('Environment'),
  SettingsService: Symbol.for('SettingsService'),
  CacheService: Symbol.for('CacheService'),
};

class InMemoryCacheService extends HttpCacheService {
  cache = new Map();

  async fetchWithCacheInternal(key, fetchFn, options) {
    const cacheKey = JSON.stringify(key);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    const promise = fetchFn();
    this.cache.set(cacheKey, promise);
    return promise;
  }
  async clearInternal() {}
}

class TestSettingsService {
  getSettings() {
    return {
      network: defaultCurrentNetwork,
      quoteCurrency: 'USD',
      assetVisibility: {},
    };
  }
}

const accountContext = process.env.ASSET_LIST_TEST_ACCOUNT_CONTEXT
  ? JSON.parse(process.env.ASSET_LIST_TEST_ACCOUNT_CONTEXT)
  : null;

if (!accountContext) {
  console.warn(
    'WARN: ASSET_LIST_TEST_ACCOUNT_CONTEXT not set — balance scenarios will be skipped.\n' +
      'Add it to packages/services/.env as a JSON string to enable balance tests.\n'
  );
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ASSERT FAIL: ${message}`);
    failed++;
    return false;
  }
  passed++;
  return true;
}

function assertSorted(items, getValue, direction, label) {
  for (let i = 1; i < items.length; i++) {
    const prev = getValue(items[i - 1]);
    const curr = getValue(items[i]);
    if (prev === undefined || curr === undefined) continue;
    if (direction === 'desc' && prev < curr) {
      assert(false, `${label}: item[${i - 1}] (${prev}) < item[${i}] (${curr}) — expected desc`);
      return;
    }
    if (direction === 'asc' && prev > curr) {
      assert(false, `${label}: item[${i - 1}] (${prev}) > item[${i}] (${curr}) — expected asc`);
      return;
    }
  }
  assert(true, `${label}: sort order correct`);
}

function logTable(items) {
  const rows = items.map(item => ({
    id: item.id,
    symbol: item.asset?.symbol ?? '-',
    price: item.marketData ? Number(item.marketData.price.amount) / 100 : '-',
    mktCap: item.marketStats?.marketCap ? Math.ceil(item.marketStats.marketCap) : '-',
    trust: item.analytics?.trustScore ? Math.ceil(item.analytics.trustScore) : '-',
    trend: item.analytics?.trendingScore ? item.analytics.trendingScore.toFixed(2) : '-',
    dist: item.analytics?.distributionScore ?? '-',
    holders: item.analytics?.holderCount ?? '-',
    '1d%': item.marketStats?.priceChange?.['1d'] ?? '-',
    '1w%': item.marketStats?.priceChange?.['1w'] ?? '-',
    bal$: item.balance ? Number(item.balance.quote.totalBalance.amount) : '-',
  }));
  console.table(rows);
}

async function main() {
  const { AssetListService } = await import('@leather.io/services');

  const container = new Container({ autobind: true, defaultScope: 'Singleton' });
  container.bind(Types.Environment).toConstantValue({ environment: 'staging' });
  container.bind(Types.SettingsService).to(TestSettingsService).inSingletonScope();
  container.bind(Types.CacheService).to(InMemoryCacheService).inSingletonScope();

  const service = container.get(AssetListService);

  const scenarios = [
    // ──────────────────────────────────────────────────────────────
    // 1. MINIMAL REQUEST — no filters, no includes, no sort
    // ──────────────────────────────────────────────────────────────
    {
      label: '1. Minimal request (no filters/includes/sort)',
      request: { filters: { includeHidden: true } },
      validate(result) {
        assert(result.items.length > 0, 'should return items');
        assert(result.meta.total === result.items.length, 'meta.total matches items.length');
        assert(result.meta.offset === 0, 'meta.offset is 0');
        assert(
          result.meta.limit === result.meta.total,
          'meta.limit equals total when no pagination'
        );
        const first = result.items[0];
        assert(first.asset !== undefined, 'asset is always present');
        assert(first.marketData === undefined, 'marketData not included');
        assert(first.marketStats === undefined, 'marketStats not included');
        assert(first.analytics === undefined, 'analytics not included');
        assert(first.balance === undefined, 'balance not included');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 2. PROTOCOL FILTER — BTC only
    // ──────────────────────────────────────────────────────────────
    {
      label: '2. Protocol filter: nativeBtc only',
      request: {
        filters: { protocols: ['nativeBtc'], includeHidden: true },
      },
      validate(result) {
        assert(result.items.length === 1, `expected 1 item, got ${result.items.length}`);
        assert(result.items[0].asset.protocol === 'nativeBtc', 'item is BTC');
        assert(
          result.items[0].id === 'nativeBtc|BTC',
          `id is nativeBtc|BTC, got ${result.items[0].id}`
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 3. PROTOCOL FILTER — STX only
    // ──────────────────────────────────────────────────────────────
    {
      label: '3. Protocol filter: nativeStx only',
      request: {
        filters: { protocols: ['nativeStx'], includeHidden: true },
      },
      validate(result) {
        assert(result.items.length === 1, `expected 1 item, got ${result.items.length}`);
        assert(result.items[0].asset.protocol === 'nativeStx', 'item is STX');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 4. PROTOCOL FILTER — SIP-10 tokens only
    // ──────────────────────────────────────────────────────────────
    {
      label: '4. Protocol filter: sip10 only',
      request: {
        filters: { protocols: ['sip10'], includeHidden: true },
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.meta.total > 0, 'should have sip10 tokens');
        assert(result.items.length <= 5, 'pagination limit respected');
        result.items.forEach((item, i) => {
          assert(item.asset.protocol === 'sip10', `item[${i}] is sip10`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 5. PROTOCOL FILTER — Runes only
    // ──────────────────────────────────────────────────────────────
    {
      label: '5. Protocol filter: rune only',
      request: {
        filters: { protocols: ['rune'], includeHidden: true },
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.meta.total > 0, 'should have rune tokens');
        result.items.forEach((item, i) => {
          assert(item.asset.protocol === 'rune', `item[${i}] is rune`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 6. CHAIN FILTER — bitcoin chain
    // ──────────────────────────────────────────────────────────────
    {
      label: '6. Chain filter: bitcoin',
      request: {
        filters: { chain: 'bitcoin', includeHidden: true },
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.meta.total > 0, 'should have bitcoin-chain assets');
        result.items.forEach((item, i) => {
          assert(
            item.asset.chain === 'bitcoin',
            `item[${i}] chain is bitcoin, got ${item.asset.chain}`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 7. CHAIN FILTER — stacks chain
    // ──────────────────────────────────────────────────────────────
    {
      label: '7. Chain filter: stacks',
      request: {
        filters: { chain: 'stacks', includeHidden: true },
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.meta.total > 0, 'should have stacks-chain assets');
        result.items.forEach((item, i) => {
          assert(
            item.asset.chain === 'stacks',
            `item[${i}] chain is stacks, got ${item.asset.chain}`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 8. COMBINED FILTER — protocol + chain (sip10 is stacks)
    // ──────────────────────────────────────────────────────────────
    {
      label: '8. Combined: protocols=[sip10, nativeBtc] + chain=stacks',
      request: {
        filters: { protocols: ['sip10', 'nativeBtc'], chain: 'stacks', includeHidden: true },
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          assert(item.asset.chain === 'stacks', `item[${i}] chain is stacks`);
          assert(
            item.asset.protocol === 'sip10',
            `item[${i}] protocol is sip10 (nativeBtc filtered by chain)`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 9. INCLUDES — marketData only
    // ──────────────────────────────────────────────────────────────
    {
      label: '9. Includes: marketData only (BTC)',
      request: {
        filters: { protocols: ['nativeBtc'], includeHidden: true },
        includes: { marketData: true },
      },
      validate(result) {
        const item = result.items[0];
        assert(item.marketData !== undefined, 'marketData is present');
        assert(item.marketData?.price !== undefined, 'price is present');
        assert(item.marketStats === undefined, 'marketStats not included');
        assert(item.analytics === undefined, 'analytics not included');
        assert(item.balance === undefined, 'balance not included');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 10. INCLUDES — marketStats only
    // ──────────────────────────────────────────────────────────────
    {
      label: '10. Includes: marketStats only (BTC)',
      request: {
        filters: { protocols: ['nativeBtc'], includeHidden: true },
        includes: { marketStats: true },
      },
      validate(result) {
        const item = result.items[0];
        assert(item.marketStats !== undefined, 'marketStats is present');
        assert(item.marketData === undefined, 'marketData not included');
        assert(item.analytics === undefined, 'analytics not included');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 11. INCLUDES — analytics only
    // ──────────────────────────────────────────────────────────────
    {
      label: '11. Includes: analytics only (BTC + STX)',
      request: {
        filters: { protocols: ['nativeBtc', 'nativeStx'], includeHidden: true },
        includes: { analytics: true },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          assert(item.marketData === undefined, `item[${i}] marketData not included`);
          assert(item.marketStats === undefined, `item[${i}] marketStats not included`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 12. INCLUDES — all data
    // ──────────────────────────────────────────────────────────────
    {
      label: '12. Includes: all data (BTC)',
      request: {
        filters: { protocols: ['nativeBtc'], includeHidden: true },
        includes: { marketData: true, marketStats: true, analytics: true },
      },
      validate(result) {
        const item = result.items[0];
        assert(item.marketData !== undefined, 'marketData present');
        assert(item.marketStats !== undefined, 'marketStats present');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 13. INCLUDES — balance with accountContext
    // ──────────────────────────────────────────────────────────────
    {
      label: '13. Includes: balance with accountContext',
      request: {
        filters: { protocols: ['nativeBtc', 'nativeStx'], includeHidden: true },
        includes: { balance: true },
        accountContext,
      },
      validate(result) {
        assert(result.items.length === 2, `expected 2, got ${result.items.length}`);
        result.items.forEach((item, i) => {
          assert(item.balance !== undefined, `item[${i}] (${item.id}) balance is present`);
          assert(
            item.balance?.crypto?.totalBalance !== undefined,
            `item[${i}] crypto.totalBalance present`
          );
          assert(
            item.balance?.quote?.totalBalance !== undefined,
            `item[${i}] quote.totalBalance present`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 14. INCLUDES — balance WITHOUT accountContext (should be undefined)
    // ──────────────────────────────────────────────────────────────
    {
      label: '14. Includes: balance without accountContext',
      request: {
        filters: { protocols: ['nativeBtc'], includeHidden: true },
        includes: { balance: true },
      },
      validate(result) {
        const item = result.items[0];
        assert(item.balance === undefined, 'balance is undefined without accountContext');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 15. THRESHOLD FILTER — minMarketCap
    // ──────────────────────────────────────────────────────────────
    {
      label: '15. Filter: minMarketCap=1000000',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minMarketCap: 1_000_000,
          includeHidden: true,
        },
        includes: { marketStats: true },
        pagination: { limit: 20, offset: 0 },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          const cap = item.marketStats?.marketCap;
          assert(
            cap !== undefined && cap >= 1_000_000,
            `item[${i}] (${item.asset.symbol}) marketCap ${cap} >= 1M`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 16. THRESHOLD FILTER — minTrustScore
    // ──────────────────────────────────────────────────────────────
    {
      label: '16. Filter: minTrustScore=50',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minTrustScore: 50,
          includeHidden: true,
        },
        includes: { analytics: true },
        pagination: { limit: 20, offset: 0 },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          const score = item.analytics?.trustScore;
          assert(
            score !== undefined && score >= 50,
            `item[${i}] (${item.asset.symbol}) trustScore ${score} >= 50`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 17. THRESHOLD FILTER — minTrendingScore
    // ──────────────────────────────────────────────────────────────
    {
      label: '17. Filter: minTrendingScore=5',
      request: {
        filters: { protocols: ['sip10'], minTrendingScore: 5, includeHidden: true },
        includes: { analytics: true },
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          const score = item.analytics?.trendingScore;
          assert(
            score !== undefined && score >= 5,
            `item[${i}] (${item.asset.symbol}) trendingScore ${score} >= 5`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 18. THRESHOLD FILTER — minDistributionScore
    // ──────────────────────────────────────────────────────────────
    {
      label: '18. Filter: minDistributionScore=20',
      request: {
        filters: { protocols: ['sip10'], minDistributionScore: 20, includeHidden: true },
        includes: { analytics: true },
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          const score = item.analytics?.distributionScore;
          assert(
            score !== undefined && score >= 20,
            `item[${i}] (${item.asset.symbol}) distributionScore ${score} >= 20`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 19. COMBINED THRESHOLD FILTERS
    // ──────────────────────────────────────────────────────────────
    {
      label:
        '19. Combined filters: minTrustScore=30 + minDistributionScore=10 + minMarketCap=100000',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minTrustScore: 30,
          minDistributionScore: 10,
          minMarketCap: 100_000,
          includeHidden: true,
        },
        includes: { analytics: true, marketStats: true },
        pagination: { limit: 15, offset: 0 },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          const trust = item.analytics?.trustScore;
          const dist = item.analytics?.distributionScore;
          const cap = item.marketStats?.marketCap;
          assert(trust !== undefined && trust >= 30, `item[${i}] trustScore >= 30`);
          assert(dist !== undefined && dist >= 10, `item[${i}] distributionScore >= 10`);
          assert(cap !== undefined && cap >= 100_000, `item[${i}] marketCap >= 100k`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 20. FILTER — hasBalance
    // ──────────────────────────────────────────────────────────────
    {
      label: '20. Filter: hasBalance=true',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          hasBalance: true,
          includeHidden: true,
        },
        includes: { balance: true },
        accountContext,
      },
      validate(result) {
        assert(result.items.length > 0, 'should return at least one item with balance');
        result.items.forEach((item, i) => {
          assert(item.balance !== undefined, `item[${i}] (${item.asset.symbol}) has balance`);
          const total = Number(item.balance?.crypto?.totalBalance?.amount ?? 0);
          assert(total > 0, `item[${i}] (${item.asset.symbol}) totalBalance > 0, got ${total}`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 21. SORT — by name ascending
    // ──────────────────────────────────────────────────────────────
    {
      label: '21. Sort: name asc (top 10 sip10)',
      request: {
        filters: { protocols: ['sip10'], includeHidden: true },
        sort: [{ field: 'name', direction: 'asc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.asset?.symbol?.toLowerCase() ?? '',
          'asc',
          'name asc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 22. SORT — by marketCap descending
    // ──────────────────────────────────────────────────────────────
    {
      label: '22. Sort: marketCap desc (top 10)',
      request: {
        filters: { protocols: ['sip10', 'nativeBtc', 'nativeStx'], includeHidden: true },
        includes: { marketStats: true },
        sort: [{ field: 'marketCap', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.marketStats?.marketCap ?? 0,
          'desc',
          'marketCap desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 23. SORT — by trustScore descending
    // ──────────────────────────────────────────────────────────────
    {
      label: '23. Sort: trustScore desc (top 10)',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minTrustScore: 10,
          minDistributionScore: 10,
          includeHidden: true,
        },
        includes: { analytics: true, marketStats: true },
        sort: [{ field: 'trustScore', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.analytics?.trustScore ?? 0,
          'desc',
          'trustScore desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 24. SORT — by trendingScore descending
    // ──────────────────────────────────────────────────────────────
    {
      label: '24. Sort: trendingScore desc',
      request: {
        filters: {
          protocols: ['sip10'],
          minTrustScore: 10,
          minDistributionScore: 10,
          includeHidden: true,
        },
        includes: { analytics: true },
        sort: [{ field: 'trendingScore', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.analytics?.trendingScore ?? 0,
          'desc',
          'trendingScore desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 25. SORT — by price descending
    // ──────────────────────────────────────────────────────────────
    {
      label: '25. Sort: price desc (top 10)',
      request: {
        filters: { protocols: ['sip10', 'nativeBtc', 'nativeStx'], includeHidden: true },
        includes: { marketData: true },
        sort: [{ field: 'price', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => Number(item.marketData?.price?.amount ?? 0),
          'desc',
          'price desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 26. SORT — by change1d descending
    // ──────────────────────────────────────────────────────────────
    {
      label: '26. Sort: change1d desc',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minTrustScore: 10,
          includeHidden: true,
        },
        includes: { marketStats: true },
        sort: [{ field: 'change1d', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.marketStats?.priceChange?.['1d'] ?? 0,
          'desc',
          'change1d desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 27. SORT — by holderCount descending
    // ──────────────────────────────────────────────────────────────
    {
      label: '27. Sort: holderCount desc',
      request: {
        filters: { protocols: ['sip10'], minTrustScore: 10, includeHidden: true },
        includes: { analytics: true },
        sort: [{ field: 'holderCount', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.analytics?.holderCount ?? 0,
          'desc',
          'holderCount desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 28. SORT — by quoteTotalBalance desc (user balances)
    // ──────────────────────────────────────────────────────────────
    {
      label: '28. Sort: quoteTotalBalance desc (user tokens)',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          hasBalance: true,
          includeHidden: true,
        },
        includes: { balance: true, marketData: true },
        sort: [
          { field: 'quoteTotalBalance', direction: 'desc' },
          { field: 'trustScore', direction: 'desc' },
        ],
        pagination: { limit: 50, offset: 0 },
        accountContext,
      },
      validate(result) {
        assertSorted(
          result.items,
          item => Number(item.balance?.quote?.totalBalance?.amount ?? 0),
          'desc',
          'quoteTotalBalance desc'
        );
        result.items.forEach((item, i) => {
          assert(item.balance !== undefined, `item[${i}] has balance`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 29. SORT — multi-field: marketCap desc, then name asc
    // ──────────────────────────────────────────────────────────────
    {
      label: '29. Multi-sort: marketCap desc, name asc',
      request: {
        filters: { protocols: ['sip10', 'nativeBtc', 'nativeStx'], includeHidden: true },
        includes: { marketStats: true },
        sort: [
          { field: 'marketCap', direction: 'desc' },
          { field: 'name', direction: 'asc' },
        ],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.marketStats?.marketCap ?? 0,
          'desc',
          'primary: marketCap desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 30. SORT-DRIVEN FETCHING — sort by price without includes.marketData
    // ──────────────────────────────────────────────────────────────
    {
      label: '30. Sort-driven fetch: sort by price, marketData NOT in includes',
      request: {
        filters: { protocols: ['nativeBtc', 'nativeStx'], includeHidden: true },
        sort: [{ field: 'price', direction: 'desc' }],
      },
      validate(result) {
        assert(result.items.length === 2, `expected 2, got ${result.items.length}`);
        assert(
          result.items[0].marketData === undefined,
          'marketData stripped from response (not in includes)'
        );
        assert(result.items[1].marketData === undefined, 'marketData stripped from response');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 31. SORT-DRIVEN FETCHING — sort by trustScore without includes.analytics
    // ──────────────────────────────────────────────────────────────
    {
      label: '31. Sort-driven fetch: sort by trustScore, analytics NOT in includes',
      request: {
        filters: { protocols: ['sip10'], minTrustScore: 20, includeHidden: true },
        sort: [{ field: 'trustScore', direction: 'desc' }],
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.items.length > 0, 'should return items');
        result.items.forEach((item, i) => {
          assert(item.analytics === undefined, `item[${i}] analytics stripped (not in includes)`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 32. SORT-DRIVEN FETCHING — sort by marketCap without includes.marketStats
    // ──────────────────────────────────────────────────────────────
    {
      label: '32. Sort-driven fetch: sort by marketCap, marketStats NOT in includes',
      request: {
        filters: { protocols: ['sip10', 'nativeBtc', 'nativeStx'], includeHidden: true },
        sort: [{ field: 'marketCap', direction: 'desc' }],
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.items.length > 0, 'should return items');
        result.items.forEach((item, i) => {
          assert(
            item.marketStats === undefined,
            `item[${i}] marketStats stripped (not in includes)`
          );
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 33. PAGINATION — page 1
    // ──────────────────────────────────────────────────────────────
    {
      label: '33. Pagination: page 1 (limit=5, offset=0)',
      request: {
        filters: { protocols: ['sip10'], includeHidden: true },
        sort: [{ field: 'name', direction: 'asc' }],
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.items.length === 5, `expected 5, got ${result.items.length}`);
        assert(result.meta.offset === 0, 'offset is 0');
        assert(result.meta.limit === 5, 'limit is 5');
        assert(result.meta.total > 5, 'total exceeds page size');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 34. PAGINATION — page 2 (consecutive pages should not overlap)
    // ──────────────────────────────────────────────────────────────
    {
      label: '34. Pagination: page 2 (limit=5, offset=5)',
      request: {
        filters: { protocols: ['sip10'], includeHidden: true },
        sort: [{ field: 'name', direction: 'asc' }],
        pagination: { limit: 5, offset: 5 },
      },
      _dependsOnLabel: '33. Pagination: page 1 (limit=5, offset=0)',
      validate(result, allResults) {
        assert(result.items.length === 5, `expected 5, got ${result.items.length}`);
        assert(result.meta.offset === 5, 'offset is 5');
        const page1 = allResults.get('33. Pagination: page 1 (limit=5, offset=0)');
        if (page1) {
          const page1Ids = new Set(page1.items.map(i => i.id));
          const hasOverlap = result.items.some(i => page1Ids.has(i.id));
          assert(!hasOverlap, 'page 2 does not overlap with page 1');
        }
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 35. PAGINATION — beyond total
    // ──────────────────────────────────────────────────────────────
    {
      label: '35. Pagination: offset beyond total',
      request: {
        filters: { protocols: ['nativeBtc'], includeHidden: true },
        pagination: { limit: 10, offset: 100 },
      },
      validate(result) {
        assert(result.items.length === 0, 'no items when offset beyond total');
        assert(result.meta.total === 1, 'total is still 1 (BTC)');
        assert(result.meta.offset === 100, 'offset preserved in meta');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 36. HIGH THRESHOLD — should return empty
    // ──────────────────────────────────────────────────────────────
    {
      label: '36. Edge: impossibly high thresholds (expect empty)',
      request: {
        filters: {
          protocols: ['sip10'],
          minTrustScore: 999,
          minMarketCap: 999_999_999_999,
          includeHidden: true,
        },
        includes: { analytics: true, marketStats: true },
      },
      validate(result) {
        assert(result.items.length === 0, `expected 0 items, got ${result.items.length}`);
        assert(result.meta.total === 0, 'total is 0');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 37. ALL PROTOCOLS (no filter) + all includes
    // ──────────────────────────────────────────────────────────────
    {
      label: '37. All protocols, all includes, sort by marketCap desc',
      request: {
        filters: { includeHidden: true },
        includes: { marketData: true, marketStats: true, analytics: true },
        sort: [{ field: 'marketCap', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assert(result.meta.total > 0, 'returns items with no protocol filter');
        const protocols = new Set(result.items.map(i => i.asset.protocol));
        assert(result.meta.total > 2, 'total includes more than just native assets');
        assertSorted(
          result.items,
          item => item.marketStats?.marketCap ?? 0,
          'desc',
          'marketCap desc (all protocols)'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 38. FULL FEATURED — top tokens scenario (corrected includes)
    // ──────────────────────────────────────────────────────────────
    {
      label: '38. Top tokens (trust+dist filters, all data, trust sort)',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minTrustScore: 10,
          minDistributionScore: 10,
          includeHidden: true,
        },
        includes: { marketStats: true, marketData: true, analytics: true },
        sort: [{ field: 'trustScore', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assert(result.items.length > 0, 'returns items');
        assertSorted(
          result.items,
          item => item.analytics?.trustScore ?? 0,
          'desc',
          'trustScore desc (top tokens)'
        );
        result.items.forEach((item, i) => {
          assert(item.marketData !== undefined, `item[${i}] has marketData`);
          assert(item.marketStats !== undefined, `item[${i}] has marketStats`);
          assert(item.analytics !== undefined, `item[${i}] has analytics`);
          const trust = item.analytics?.trustScore;
          assert(trust !== undefined && trust >= 10, `item[${i}] trustScore >= 10`);
          const dist = item.analytics?.distributionScore;
          assert(dist !== undefined && dist >= 10, `item[${i}] distributionScore >= 10`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 39. FULL FEATURED — user portfolio with runes
    // ──────────────────────────────────────────────────────────────
    {
      label: '39. User portfolio: all protocols, hasBalance, sort by quoteTotalBalance',
      request: {
        filters: { hasBalance: true, includeHidden: true },
        includes: { balance: true, marketData: true, marketStats: true },
        sort: [{ field: 'quoteTotalBalance', direction: 'desc' }],
        pagination: { limit: 50, offset: 0 },
        accountContext,
      },
      validate(result) {
        result.items.forEach((item, i) => {
          assert(item.balance !== undefined, `item[${i}] (${item.asset.symbol}) has balance`);
          assert(item.marketData !== undefined, `item[${i}] has marketData`);
          assert(item.marketStats !== undefined, `item[${i}] has marketStats`);
          assert(item.analytics === undefined, `item[${i}] analytics NOT included`);
        });
        assertSorted(
          result.items,
          item => Number(item.balance?.quote?.totalBalance?.amount ?? 0),
          'desc',
          'quoteTotalBalance desc (portfolio)'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 40. SORT — change1w ascending (biggest losers)
    // ──────────────────────────────────────────────────────────────
    {
      label: '40. Sort: change1w asc (biggest weekly losers)',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minTrustScore: 10,
          includeHidden: true,
        },
        includes: { marketStats: true },
        sort: [{ field: 'change1w', direction: 'asc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.marketStats?.priceChange?.['1w'] ?? 0,
          'asc',
          'change1w asc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 41. SORT — distributionScore desc
    // ──────────────────────────────────────────────────────────────
    {
      label: '41. Sort: distributionScore desc',
      request: {
        filters: { protocols: ['sip10'], minDistributionScore: 10, includeHidden: true },
        includes: { analytics: true },
        sort: [{ field: 'distributionScore', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assertSorted(
          result.items,
          item => item.analytics?.distributionScore ?? 0,
          'desc',
          'distributionScore desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 42. RUNES — with market data
    // ──────────────────────────────────────────────────────────────
    {
      label: '42. Runes: sorted by price desc with market data',
      request: {
        filters: { protocols: ['rune'], includeHidden: true },
        includes: { marketData: true, marketStats: true },
        sort: [{ field: 'price', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          assert(item.asset.protocol === 'rune', `item[${i}] is rune`);
        });
        assertSorted(
          result.items,
          item => Number(item.marketData?.price?.amount ?? 0),
          'desc',
          'rune price desc'
        );
      },
    },

    // ══════════════════════════════════════════════════════════════
    // COMBINATION SCENARIOS
    // ══════════════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────────────
    // 43. hasBalance + threshold filters — quality wallet tokens
    // ──────────────────────────────────────────────────────────────
    {
      label: '43. Combo: hasBalance + minTrustScore + minDistributionScore',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          hasBalance: true,
          minTrustScore: 10,
          minDistributionScore: 10,
          includeHidden: true,
        },
        includes: { balance: true, analytics: true, marketStats: true },
        sort: [{ field: 'quoteTotalBalance', direction: 'desc' }],
        accountContext,
      },
      validate(result) {
        result.items.forEach((item, i) => {
          const sym = item.asset.symbol;
          assert(item.balance !== undefined, `item[${i}] (${sym}) has balance`);
          const total = Number(item.balance?.crypto?.totalBalance?.amount ?? 0);
          assert(total > 0, `item[${i}] (${sym}) crypto balance > 0`);
          const trust = item.analytics?.trustScore;
          assert(
            trust !== undefined && trust >= 10,
            `item[${i}] (${sym}) trustScore ${trust} >= 10`
          );
          const dist = item.analytics?.distributionScore;
          assert(
            dist !== undefined && dist >= 10,
            `item[${i}] (${sym}) distributionScore ${dist} >= 10`
          );
        });
        assertSorted(
          result.items,
          item => Number(item.balance?.quote?.totalBalance?.amount ?? 0),
          'desc',
          'quoteTotalBalance desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 44. Chain filter + threshold + sort + pagination — stacks quality tokens page 1 vs 2
    // ──────────────────────────────────────────────────────────────
    {
      label: '44. Combo: chain=stacks + minTrustScore + sort marketCap desc, page 1',
      request: {
        filters: { chain: 'stacks', minTrustScore: 10, includeHidden: true },
        includes: { marketStats: true, analytics: true },
        sort: [{ field: 'marketCap', direction: 'desc' }],
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.meta.total > 5, `total (${result.meta.total}) > 5 for page test`);
        assert(result.items.length === 5, `returned 5 items`);
        result.items.forEach((item, i) => {
          assert(item.asset.chain === 'stacks', `item[${i}] chain is stacks`);
          assert((item.analytics?.trustScore ?? 0) >= 10, `item[${i}] trustScore >= 10`);
          assert(item.marketStats !== undefined, `item[${i}] marketStats included`);
        });
        assertSorted(
          result.items,
          item => item.marketStats?.marketCap ?? 0,
          'desc',
          'marketCap desc'
        );
      },
    },
    {
      label: '45. Combo: chain=stacks + minTrustScore + sort marketCap desc, page 2',
      request: {
        filters: { chain: 'stacks', minTrustScore: 10, includeHidden: true },
        includes: { marketStats: true, analytics: true },
        sort: [{ field: 'marketCap', direction: 'desc' }],
        pagination: { limit: 5, offset: 5 },
      },
      validate(result, allResults) {
        assert(result.items.length > 0, 'page 2 has items');
        const page1 = allResults.get(
          '44. Combo: chain=stacks + minTrustScore + sort marketCap desc, page 1'
        );
        if (page1) {
          assert(
            result.meta.total === page1.meta.total,
            `total consistent across pages (${result.meta.total} vs ${page1.meta.total})`
          );
          const page1Ids = new Set(page1.items.map(i => i.id));
          assert(!result.items.some(i => page1Ids.has(i.id)), 'no overlap between pages');
          const lastPage1Cap = page1.items.at(-1)?.marketStats?.marketCap ?? 0;
          const firstPage2Cap = result.items[0]?.marketStats?.marketCap ?? 0;
          assert(
            lastPage1Cap >= firstPage2Cap,
            `last page1 cap (${lastPage1Cap}) >= first page2 cap (${firstPage2Cap})`
          );
        }
        assertSorted(
          result.items,
          item => item.marketStats?.marketCap ?? 0,
          'desc',
          'marketCap desc page 2'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 46. hasBalance filter works without includes.balance — filter runs but data stripped
    // ──────────────────────────────────────────────────────────────
    {
      label: '46. Combo: hasBalance filter but balance NOT in includes',
      request: {
        filters: {
          protocols: ['nativeBtc', 'nativeStx', 'sip10'],
          hasBalance: true,
          includeHidden: true,
        },
        includes: { marketData: true },
        accountContext,
      },
      validate(result) {
        assert(result.items.length > 0, 'items returned despite balance not in includes');
        result.items.forEach((item, i) => {
          assert(item.balance === undefined, `item[${i}] balance stripped (not in includes)`);
          assert(item.marketData !== undefined, `item[${i}] marketData present (in includes)`);
          assert(item.analytics === undefined, `item[${i}] analytics not present`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 47. Sort-driven fetch coexists with filter-driven fetch for same data
    //     minTrustScore needs analytics (filter), sort by distributionScore needs analytics (sort)
    // ──────────────────────────────────────────────────────────────
    {
      label: '47. Combo: minTrustScore filter + sort by distributionScore (both need analytics)',
      request: {
        filters: { protocols: ['sip10'], minTrustScore: 20, includeHidden: true },
        includes: { analytics: true },
        sort: [{ field: 'distributionScore', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        result.items.forEach((item, i) => {
          const trust = item.analytics?.trustScore;
          assert(trust !== undefined && trust >= 20, `item[${i}] trustScore ${trust} >= 20`);
        });
        assertSorted(
          result.items,
          item => item.analytics?.distributionScore ?? 0,
          'desc',
          'distributionScore desc (filtered by trustScore)'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 48. minMarketCap filter + sort by change1d — top movers among large caps
    // ──────────────────────────────────────────────────────────────
    {
      label: '48. Combo: minMarketCap=1M + sort change1d desc (big cap top movers)',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minMarketCap: 1_000_000,
          includeHidden: true,
        },
        includes: { marketStats: true, marketData: true },
        sort: [{ field: 'change1d', direction: 'desc' }],
      },
      validate(result) {
        result.items.forEach((item, i) => {
          const cap = item.marketStats?.marketCap;
          assert(
            cap !== undefined && cap >= 1_000_000,
            `item[${i}] (${item.asset.symbol}) marketCap ${cap} >= 1M`
          );
          assert(item.marketData !== undefined, `item[${i}] marketData present`);
        });
        assertSorted(
          result.items,
          item => item.marketStats?.priceChange?.['1d'] ?? 0,
          'desc',
          'change1d desc among large caps'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 49. All protocols unfiltered + balance + sort by price (sort-driven marketData)
    //     Tests: no protocol filter, balance hydration, sort-driven marketData fetch, price stripped
    // ──────────────────────────────────────────────────────────────
    {
      label: '49. Combo: all protocols + hasBalance + sort by price (marketData not in includes)',
      request: {
        filters: { hasBalance: true, includeHidden: true },
        includes: { balance: true },
        sort: [{ field: 'price', direction: 'desc' }],
        accountContext,
      },
      validate(result) {
        assert(result.items.length > 0, 'has items with balance');
        result.items.forEach((item, i) => {
          assert(item.balance !== undefined, `item[${i}] (${item.asset.symbol}) has balance`);
          assert(
            item.marketData === undefined,
            `item[${i}] marketData stripped (sort-driven only)`
          );
        });
        const protocols = new Set(result.items.map(i => i.asset.protocol));
        assert(protocols.has('nativeBtc') || protocols.has('nativeStx'), 'includes native assets');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 50. Multi-sort with secondary tiebreaker actually mattering
    //     Sort by change1d desc, then trustScore desc — among tokens with 0% 1d change
    // ──────────────────────────────────────────────────────────────
    {
      label: '50. Combo: multi-sort change1d desc + trustScore desc (tiebreaker test)',
      request: {
        filters: {
          protocols: ['sip10'],
          minTrustScore: 10,
          minDistributionScore: 10,
          includeHidden: true,
        },
        includes: { marketStats: true, analytics: true },
        sort: [
          { field: 'change1d', direction: 'desc' },
          { field: 'trustScore', direction: 'desc' },
        ],
        pagination: { limit: 20, offset: 0 },
      },
      validate(result) {
        assert(result.items.length > 0, 'has items');
        for (let i = 1; i < result.items.length; i++) {
          const prev = result.items[i - 1];
          const curr = result.items[i];
          const prevChange = prev.marketStats?.priceChange?.['1d'] ?? 0;
          const currChange = curr.marketStats?.priceChange?.['1d'] ?? 0;
          assert(
            prevChange >= currChange,
            `primary sort: item[${i - 1}] 1d (${prevChange}) >= item[${i}] (${currChange})`
          );
          if (prevChange === currChange) {
            const prevTrust = prev.analytics?.trustScore ?? 0;
            const currTrust = curr.analytics?.trustScore ?? 0;
            assert(
              prevTrust >= currTrust,
              `tiebreaker: when 1d equal (${prevChange}), trustScore ${prevTrust} >= ${currTrust}`
            );
          }
        }
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 51. Protocol subset + chain + all thresholds + all includes + multi-sort + pagination
    //     The "everything at once" test
    // ──────────────────────────────────────────────────────────────
    {
      label: '51. Combo: everything — protocols+chain+thresholds+includes+sort+pagination',
      request: {
        filters: {
          protocols: ['sip10', 'nativeStx'],
          chain: 'stacks',
          minMarketCap: 100_000,
          minTrustScore: 10,
          minDistributionScore: 10,
          includeHidden: true,
        },
        includes: { marketData: true, marketStats: true, analytics: true },
        sort: [
          { field: 'trustScore', direction: 'desc' },
          { field: 'marketCap', direction: 'desc' },
        ],
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.items.length > 0, 'returns items');
        assert(result.items.length <= 5, 'respects pagination limit');
        result.items.forEach((item, i) => {
          assert(item.asset.chain === 'stacks', `item[${i}] chain stacks`);
          assert(['sip10', 'nativeStx'].includes(item.asset.protocol), `item[${i}] protocol valid`);
          assert(item.marketData !== undefined, `item[${i}] marketData present`);
          assert(item.marketStats !== undefined, `item[${i}] marketStats present`);
          assert(item.analytics !== undefined, `item[${i}] analytics present`);
          assert((item.marketStats?.marketCap ?? 0) >= 100_000, `item[${i}] marketCap >= 100k`);
          assert((item.analytics?.trustScore ?? 0) >= 10, `item[${i}] trustScore >= 10`);
          assert(
            (item.analytics?.distributionScore ?? 0) >= 10,
            `item[${i}] distributionScore >= 10`
          );
        });
        assertSorted(
          result.items,
          item => item.analytics?.trustScore ?? 0,
          'desc',
          'trustScore desc (everything combo)'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 52. Bitcoin chain + balance + sort by quoteAvailableBalance
    //     Tests: runes + BTC balances, quoteAvailableBalance sort field
    // ──────────────────────────────────────────────────────────────
    {
      label: '52. Combo: bitcoin chain + hasBalance + sort quoteAvailableBalance desc',
      request: {
        filters: { chain: 'bitcoin', hasBalance: true, includeHidden: true },
        includes: { balance: true, marketData: true },
        sort: [{ field: 'quoteAvailableBalance', direction: 'desc' }],
        accountContext,
      },
      validate(result) {
        result.items.forEach((item, i) => {
          assert(item.asset.chain === 'bitcoin', `item[${i}] chain is bitcoin`);
          assert(item.balance !== undefined, `item[${i}] (${item.asset.symbol}) has balance`);
          assert(item.marketData !== undefined, `item[${i}] marketData present`);
        });
        assertSorted(
          result.items,
          item => Number(item.balance?.quote?.availableBalance?.amount ?? 0),
          'desc',
          'quoteAvailableBalance desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 53. Stacks chain + balance + sort by holderCount desc
    //     Tests: sort-driven analytics fetch + balance + chain filter
    // ──────────────────────────────────────────────────────────────
    {
      label: '53. Combo: stacks + hasBalance + sort holderCount desc + analytics included',
      request: {
        filters: { chain: 'stacks', hasBalance: true, includeHidden: true },
        includes: { balance: true, analytics: true },
        sort: [{ field: 'holderCount', direction: 'desc' }],
        accountContext,
      },
      validate(result) {
        assert(result.items.length > 0, 'has stacks items with balance');
        result.items.forEach((item, i) => {
          assert(item.asset.chain === 'stacks', `item[${i}] chain is stacks`);
          assert(item.balance !== undefined, `item[${i}] has balance`);
        });
        assertSorted(
          result.items,
          item => item.analytics?.holderCount ?? 0,
          'desc',
          'holderCount desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 54. Sort-driven: sort by quoteTotalBalance without includes.balance or accountContext
    //     Should still work (sort values default to 0), just no balance data
    // ──────────────────────────────────────────────────────────────
    {
      label: '54. Combo: sort by quoteTotalBalance without accountContext (graceful degradation)',
      request: {
        filters: { protocols: ['nativeBtc', 'nativeStx'], includeHidden: true },
        sort: [{ field: 'quoteTotalBalance', direction: 'desc' }],
      },
      validate(result) {
        assert(result.items.length === 2, `expected 2, got ${result.items.length}`);
        result.items.forEach((item, i) => {
          assert(item.balance === undefined, `item[${i}] balance undefined (no accountContext)`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 55. Meta consistency: total count survives all filter+sort stages
    //     Paginate into the middle and verify meta.total matches full-count query
    // ──────────────────────────────────────────────────────────────
    {
      label: '55. Combo: meta.total consistency — paginated vs unpaginated',
      request: {
        filters: {
          protocols: ['sip10'],
          minTrustScore: 10,
          minDistributionScore: 10,
          includeHidden: true,
        },
        includes: { analytics: true },
        sort: [{ field: 'trustScore', direction: 'desc' }],
        pagination: { limit: 3, offset: 2 },
      },
      validate(result, allResults) {
        const fullResult = allResults.get(
          '31. Sort-driven fetch: sort by trustScore, analytics NOT in includes'
        );
        if (fullResult) {
          // Both use minTrustScore: 20 vs 10, different thresholds so can't compare directly
          // but we can verify internal consistency
          assert(result.meta.total >= result.items.length, 'total >= returned items');
        }
        assert(result.meta.offset === 2, 'offset is 2');
        assert(result.meta.limit === 3, 'limit is 3');
        assert(result.items.length <= 3, 'returned at most 3 items');
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 56. Full wallet view: user tokens with market data, sorted by balance then price
    // ──────────────────────────────────────────────────────────────
    {
      label:
        '56. Combo: user wallet — balance+marketData+marketStats, sort balance desc then price desc',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          hasBalance: true,
          includeHidden: true,
        },
        includes: { balance: true, marketData: true, marketStats: true },
        sort: [
          { field: 'quoteTotalBalance', direction: 'desc' },
          { field: 'price', direction: 'desc' },
        ],
        accountContext,
      },
      validate(result) {
        assert(result.items.length > 0, 'has items');
        result.items.forEach((item, i) => {
          assert(item.balance !== undefined, `item[${i}] (${item.asset.symbol}) has balance`);
          assert(item.marketData !== undefined, `item[${i}] has marketData`);
          assert(item.marketStats !== undefined, `item[${i}] has marketStats`);
          assert(item.analytics === undefined, `item[${i}] analytics NOT included`);
        });
        assertSorted(
          result.items,
          item => Number(item.balance?.quote?.totalBalance?.amount ?? 0),
          'desc',
          'primary: quoteTotalBalance desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 57. Discovery feed: trending tokens filtered by quality, paginated
    // ──────────────────────────────────────────────────────────────
    {
      label: '57. Combo: discovery feed — trending sort + quality filters + pagination + all data',
      request: {
        filters: {
          protocols: ['sip10'],
          minTrustScore: 10,
          minDistributionScore: 15,
          minMarketCap: 50_000,
          includeHidden: true,
        },
        includes: { marketData: true, marketStats: true, analytics: true },
        sort: [{ field: 'trendingScore', direction: 'desc' }],
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.items.length > 0, 'has items');
        result.items.forEach((item, i) => {
          assert(item.marketData !== undefined, `item[${i}] marketData`);
          assert(item.marketStats !== undefined, `item[${i}] marketStats`);
          assert(item.analytics !== undefined, `item[${i}] analytics`);
          assert((item.analytics?.trustScore ?? 0) >= 10, `item[${i}] trustScore >= 10`);
          assert((item.analytics?.distributionScore ?? 0) >= 15, `item[${i}] distScore >= 15`);
          assert((item.marketStats?.marketCap ?? 0) >= 50_000, `item[${i}] marketCap >= 50k`);
        });
        assertSorted(
          result.items,
          item => item.analytics?.trendingScore ?? 0,
          'desc',
          'trendingScore desc (discovery)'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 58. Runes + SIP-10 together, bitcoin chain filter removes SIP-10
    // ──────────────────────────────────────────────────────────────
    {
      label: '58. Combo: protocols=[rune, sip10] + chain=bitcoin — only runes survive',
      request: {
        filters: { protocols: ['rune', 'sip10'], chain: 'bitcoin', includeHidden: true },
        includes: { marketData: true },
        sort: [{ field: 'price', direction: 'desc' }],
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.meta.total > 0, 'has results');
        result.items.forEach((item, i) => {
          assert(
            item.asset.protocol === 'rune',
            `item[${i}] is rune (sip10 filtered by chain=bitcoin)`
          );
          assert(item.asset.chain === 'bitcoin', `item[${i}] chain is bitcoin`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 59. Multi-sort: quoteTotalBalance desc, change1w desc
    //     Tests: balance-driven + marketStats-driven sort together
    // ──────────────────────────────────────────────────────────────
    {
      label: '59. Combo: multi-sort quoteTotalBalance + change1w (needs balance + marketStats)',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          hasBalance: true,
          includeHidden: true,
        },
        includes: { balance: true, marketStats: true },
        sort: [
          { field: 'quoteTotalBalance', direction: 'desc' },
          { field: 'change1w', direction: 'desc' },
        ],
        accountContext,
      },
      validate(result) {
        assert(result.items.length > 0, 'has items');
        result.items.forEach((item, i) => {
          assert(item.balance !== undefined, `item[${i}] has balance`);
          assert(item.marketStats !== undefined, `item[${i}] has marketStats`);
          assert(item.marketData === undefined, `item[${i}] marketData not included`);
          assert(item.analytics === undefined, `item[${i}] analytics not included`);
        });
        assertSorted(
          result.items,
          item => Number(item.balance?.quote?.totalBalance?.amount ?? 0),
          'desc',
          'quoteTotalBalance desc'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 60. Verify pagination window slides correctly across full sorted dataset
    //     Fetch page 1 and page 2 of a sorted+filtered set, verify continuity
    // ──────────────────────────────────────────────────────────────
    {
      label: '60a. Combo: sorted+filtered page 1 for continuity test',
      request: {
        filters: { protocols: ['sip10'], minTrustScore: 5, includeHidden: true },
        includes: { analytics: true, marketStats: true },
        sort: [{ field: 'holderCount', direction: 'desc' }],
        pagination: { limit: 5, offset: 0 },
      },
      validate(result) {
        assert(result.items.length === 5, 'page 1 has 5 items');
        assertSorted(
          result.items,
          item => item.analytics?.holderCount ?? 0,
          'desc',
          'holderCount desc page 1'
        );
      },
    },
    {
      label: '60b. Combo: sorted+filtered page 2 — continuity with page 1',
      request: {
        filters: { protocols: ['sip10'], minTrustScore: 5, includeHidden: true },
        includes: { analytics: true, marketStats: true },
        sort: [{ field: 'holderCount', direction: 'desc' }],
        pagination: { limit: 5, offset: 5 },
      },
      validate(result, allResults) {
        assert(result.items.length === 5, 'page 2 has 5 items');
        const page1 = allResults.get('60a. Combo: sorted+filtered page 1 for continuity test');
        if (page1) {
          const page1Ids = new Set(page1.items.map(i => i.id));
          assert(!result.items.some(i => page1Ids.has(i.id)), 'no overlap with page 1');
          const lastP1Holders = page1.items.at(-1)?.analytics?.holderCount ?? 0;
          const firstP2Holders = result.items[0]?.analytics?.holderCount ?? 0;
          assert(
            lastP1Holders >= firstP2Holders,
            `page boundary continuous: p1 last (${lastP1Holders}) >= p2 first (${firstP2Holders})`
          );
          assert(result.meta.total === page1.meta.total, 'total consistent across pages');
        }
        assertSorted(
          result.items,
          item => item.analytics?.holderCount ?? 0,
          'desc',
          'holderCount desc page 2'
        );
      },
    },

    // ══════════════════════════════════════════════════════════════
    // VISIBILITY SCENARIOS (default = visible only, includeHidden to see all)
    // ══════════════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────────────
    // 61. Default (visible only) returns subset or equal to includeHidden
    // ──────────────────────────────────────────────────────────────
    {
      label: '61. Visibility: default (visible only) returns subset or equal to includeHidden',
      request: {
        filters: { protocols: ['sip10'] },
        pagination: { limit: 200, offset: 0 },
      },
      validate(result, allResults) {
        assert(result.meta.total > 0, 'has visible sip10 items');
        const unfiltered = allResults.get('4. Protocol filter: sip10 only');
        if (unfiltered) {
          assert(
            result.meta.total <= unfiltered.meta.total,
            `visible (${result.meta.total}) <= all sip10 (${unfiltered.meta.total})`
          );
        }
        result.items.forEach((item, i) => {
          assert(item.asset.protocol === 'sip10', `item[${i}] is sip10`);
        });
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 62. Default visibility + sort + includes — visible tokens sorted by trustScore
    // ──────────────────────────────────────────────────────────────
    {
      label: '62. Visibility: default + trustScore sort + analytics+marketData',
      request: {
        filters: { protocols: ['sip10', 'nativeBtc', 'nativeStx'] },
        includes: { analytics: true, marketData: true },
        sort: [{ field: 'trustScore', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result) {
        assert(result.items.length > 0, 'has items');
        result.items.forEach((item, i) => {
          assert(item.marketData !== undefined, `item[${i}] has marketData`);
        });
        assertSorted(
          result.items,
          item => item.analytics?.trustScore ?? 0,
          'desc',
          'trustScore desc (visible only)'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 63. Default visibility + hasBalance — wallet view with only visible tokens
    // ──────────────────────────────────────────────────────────────
    {
      label: '63. Visibility: default + hasBalance + balance sort',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          hasBalance: true,
        },
        includes: { balance: true, marketData: true },
        sort: [{ field: 'quoteTotalBalance', direction: 'desc' }],
        accountContext,
      },
      validate(result) {
        assert(result.items.length > 0, 'has visible items with balance');
        result.items.forEach((item, i) => {
          assert(item.balance !== undefined, `item[${i}] (${item.asset.symbol}) has balance`);
          assert(item.marketData !== undefined, `item[${i}] has marketData`);
          const total = Number(item.balance?.crypto?.totalBalance?.amount ?? 0);
          assert(total > 0, `item[${i}] (${item.asset.symbol}) balance > 0`);
        });
        assertSorted(
          result.items,
          item => Number(item.balance?.quote?.totalBalance?.amount ?? 0),
          'desc',
          'quoteTotalBalance desc (visible wallet)'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 64. Default visibility + threshold filters — quality visible tokens
    // ──────────────────────────────────────────────────────────────
    {
      label: '64. Visibility: default + minTrustScore + minMarketCap',
      request: {
        filters: {
          protocols: ['sip10', 'nativeBtc', 'nativeStx'],
          minTrustScore: 20,
          minMarketCap: 100_000,
        },
        includes: { analytics: true, marketStats: true },
        sort: [{ field: 'marketCap', direction: 'desc' }],
      },
      validate(result) {
        assert(result.items.length > 0, 'has visible quality items');
        result.items.forEach((item, i) => {
          const trust = item.analytics?.trustScore;
          assert(
            trust !== undefined && trust >= 20,
            `item[${i}] (${item.asset.symbol}) trustScore ${trust} >= 20`
          );
          const cap = item.marketStats?.marketCap;
          assert(
            cap !== undefined && cap >= 100_000,
            `item[${i}] (${item.asset.symbol}) marketCap ${cap} >= 100k`
          );
        });
        assertSorted(
          result.items,
          item => item.marketStats?.marketCap ?? 0,
          'desc',
          'marketCap desc (visible + quality)'
        );
      },
    },

    // ──────────────────────────────────────────────────────────────
    // 65. Default visibility with runes — visible runes sorted by price
    // ──────────────────────────────────────────────────────────────
    {
      label: '65. Visibility: default runes + price sort',
      request: {
        filters: { protocols: ['rune'] },
        includes: { marketData: true },
        sort: [{ field: 'price', direction: 'desc' }],
        pagination: { limit: 10, offset: 0 },
      },
      validate(result, allResults) {
        assert(result.meta.total > 0, 'has visible runes');
        const allRunes = allResults.get('5. Protocol filter: rune only');
        if (allRunes) {
          assert(
            result.meta.total <= allRunes.meta.total,
            `visible runes (${result.meta.total}) <= all runes (${allRunes.meta.total})`
          );
        }
        result.items.forEach((item, i) => {
          assert(item.asset.protocol === 'rune', `item[${i}] is rune`);
          assert(item.marketData !== undefined, `item[${i}] has marketData`);
        });
        assertSorted(
          result.items,
          item => Number(item.marketData?.price?.amount ?? 0),
          'desc',
          'price desc (visible runes)'
        );
      },
    },
  ];

  console.log(`\nRunning ${scenarios.length} scenarios against AssetListService...\n`);
  const allResults = new Map();
  let scenariosPassed = 0;
  let scenariosFailed = 0;
  let scenariosSkipped = 0;

  for (const scenario of scenarios) {
    if (scenario.request.accountContext && !accountContext) {
      console.log(`\n--- ${scenario.label} SKIPPED (no accountContext) ---`);
      scenariosSkipped++;
      continue;
    }

    const start = performance.now();
    const prevPassed = passed;
    const prevFailed = failed;
    try {
      const result = await service.getAssetList(scenario.request);
      const duration = Math.round(performance.now() - start);
      allResults.set(scenario.label, result);

      console.log(`\n--- ${scenario.label} (${duration}ms) ---`);
      console.log(
        `Total: ${result.meta.total} | Returned: ${result.items.length} | Offset: ${result.meta.offset} | Limit: ${result.meta.limit}`
      );

      if (result.items.length > 0 && result.items.length <= 15) {
        logTable(result.items);
      } else if (result.items.length > 15) {
        logTable(result.items.slice(0, 10));
        console.log(`  ... and ${result.items.length - 10} more`);
      }

      scenario.validate(result, allResults);

      const newFails = failed - prevFailed;
      if (newFails > 0) {
        scenariosFailed++;
        console.log(`  SCENARIO: FAIL (${newFails} assertion(s) failed)`);
      } else {
        scenariosPassed++;
        const newPasses = passed - prevPassed;
        console.log(`  SCENARIO: PASS (${newPasses} assertions)`);
      }
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      scenariosFailed++;
      failed++;
      console.error(`\n--- ${scenario.label} FAILED (${duration}ms) ---`);
      console.error(`  ERROR: ${err.message}`);
      if (err.stack) {
        const relevantStack = err.stack.split('\n').slice(0, 4).join('\n');
        console.error(relevantStack);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  const ran = scenariosPassed + scenariosFailed;
  console.log(`RESULTS: ${scenariosPassed}/${ran} scenarios passed`);
  if (scenariosSkipped > 0) {
    console.log(`SKIPPED: ${scenariosSkipped} scenarios (no accountContext)`);
  }
  console.log(`ASSERTIONS: ${passed} passed, ${failed} failed`);
  if (scenariosFailed > 0) {
    console.log(`FAILED SCENARIOS: ${scenariosFailed}`);
  }
  console.log('='.repeat(60));

  process.exit(scenariosFailed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
