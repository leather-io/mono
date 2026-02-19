import 'reflect-metadata';

import { Container } from 'inversify';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defaultCurrentNetwork } from '@leather.io/models';
import { HttpCacheService } from '@leather.io/services';

// ╔══════════════════════════════════════════════════════════════╗
// ║  ASSET LIST PLAYGROUND                                      ║
// ║                                                             ║
// ║  Edit the `request` object below to explore different       ║
// ║  queries against the asset list service. Run with:          ║
// ║                                                             ║
// ║    cd packages/services && pnpm asset-list                   ║
// ║                                                             ║
// ║  See docs/fungible-token-data-guide.md for full reference   ║
// ║  on available filters, sort fields, and data types.         ║
// ╚══════════════════════════════════════════════════════════════╝

// ──────────────────────────────────────────────────────────────
//  👇 EDIT THIS — your query goes here
// ──────────────────────────────────────────────────────────────

const request = {
  // FILTERS — narrow down which tokens to include
  filters: {
    protocols: ['nativeBtc', 'nativeStx', 'sip10'],
    // chain: 'stacks',          // 'bitcoin' | 'stacks'
    // minMarketCap: 1_000_000,
    // minTrustScore: 10,
    // minTrendingScore: 10,
    // minDistributionScore: 10,
    // hasBalance: true, // only tokens the user holds (needs accountContext)
    // includeHidden: true,      // include hidden tokens (visible only by default)
  },

  // INCLUDES — what data to attach to each item (all off by default)
  includes: {
    marketData: true, // current price
    marketStats: true, // market cap + price changes (1d, 1w, 1m, etc.)
    analytics: true, // trust/trending/distribution scores, holder count
    // balance: true,            // user balances (needs accountContext)
  },

  // SORT — array of { field, direction } pairs, applied in order
  sort: [
    // { field: 'marketCap', direction: 'desc' },
    { field: 'trustScore', direction: 'desc' },
    // { field: 'trendingScore', direction: 'desc' },
    // { field: 'change1d', direction: 'desc' },
    // { field: 'price', direction: 'desc' },
    // { field: 'holderCount', direction: 'desc' },
    // { field: 'quoteTotalBalance', direction: 'desc' },
  ],

  // PAGINATION
  pagination: { limit: 50, offset: 0 },
};

// ──────────────────────────────────────────────────────────────
//  EXAMPLE RECIPES — uncomment one to replace the request above
// ──────────────────────────────────────────────────────────────

// // Top tokens by market cap
// const request = {
//   filters: { minMarketCap: 1_000_000 },
//   includes: { marketData: true, marketStats: true },
//   sort: [{ field: 'marketCap', direction: 'desc' }],
//   pagination: { limit: 20, offset: 0 },
// };

// // Trending SIP-10 tokens
// const request = {
//   filters: { protocols: ['sip10'], minTrendingScore: 5, minTrustScore: 10 },
//   includes: { analytics: true, marketStats: true, marketData: true },
//   sort: [{ field: 'trendingScore', direction: 'desc' }],
//   pagination: { limit: 20, offset: 0 },
// };

// // High-trust Stacks tokens
// const request = {
//   filters: { chain: 'stacks', minTrustScore: 50, minDistributionScore: 20 },
//   includes: { analytics: true, marketData: true },
//   sort: [{ field: 'trustScore', direction: 'desc' }],
//   pagination: { limit: 20, offset: 0 },
// };

// // Runes sorted by price
// const request = {
//   filters: { protocols: ['rune'] },
//   includes: { marketData: true, marketStats: true },
//   sort: [{ field: 'price', direction: 'desc' }],
//   pagination: { limit: 20, offset: 0 },
// };

// // Daily movers (biggest 24h gainers)
// const request = {
//   filters: { minTrustScore: 10, minMarketCap: 100_000 },
//   includes: { marketStats: true, marketData: true },
//   sort: [{ field: 'change1d', direction: 'desc' }],
//   pagination: { limit: 20, offset: 0 },
// };

// // User portfolio (needs accountContext in .env)
// const request = {
//   filters: { hasBalance: true },
//   includes: { balance: true, marketData: true, marketStats: true },
//   sort: [{ field: 'quoteTotalBalance', direction: 'desc' }],
// };

// ══════════════════════════════════════════════════════════════
//  Everything below is setup + output formatting — no need to
//  edit unless you want to customize the output.
// ══════════════════════════════════════════════════════════════

function loadEnv() {
  try {
    const envPath = resolve(new URL('.', import.meta.url).pathname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^(\w+)=['"](.*)['"]\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    console.error('Error loading .env');
  }
}
loadEnv();

const Types = {
  Environment: Symbol.for('Environment'),
  SettingsService: Symbol.for('SettingsService'),
  CacheService: Symbol.for('CacheService'),
};

class InMemoryCacheService extends HttpCacheService {
  cache = new Map();
  async fetchWithCacheInternal(key, fetchFn) {
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

function moneyToNum(money) {
  if (!money) return null;
  return Number(money.amount) / 10 ** money.decimals;
}

function fmtMktCap(cap) {
  if (cap === undefined || cap === null) return '-';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  if (cap >= 1e3) return `$${(cap / 1e3).toFixed(0)}K`;
  return `$${cap.toFixed(0)}`;
}

function fmtPct(val) {
  if (val === undefined || val === null) return '-';
  return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
}

function fmtPrice(money) {
  const num = moneyToNum(money);
  if (num === null) return '-';
  if (num >= 1)
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${num.toFixed(6)}`;
}

function printResults(result) {
  console.log(
    `\n${result.meta.total} total items, showing ${result.items.length} (offset ${result.meta.offset})\n`
  );

  if (result.items.length === 0) {
    console.log('No items matched your query.\n');
    return;
  }

  const first = result.items[0];
  const hasMarketData = first.marketData !== undefined;
  const hasMarketStats = first.marketStats !== undefined;
  const hasAnalytics = first.analytics !== undefined;
  const hasBalance = first.balance !== undefined;

  const rows = result.items.map(item => {
    const row = {
      symbol: item.asset.symbol ?? '-',
      protocol: item.asset.protocol,
    };

    if (hasMarketData) {
      row.price = fmtPrice(item.marketData?.price);
    }

    if (hasMarketStats) {
      row.mktCap = fmtMktCap(item.marketStats?.marketCap);
      row['1d%'] = fmtPct(item.marketStats?.priceChange?.['1d']);
      row['1w%'] = fmtPct(item.marketStats?.priceChange?.['1w']);
      row['1m%'] = fmtPct(item.marketStats?.priceChange?.['1m']);
    }

    if (hasAnalytics) {
      row.trust = item.analytics?.trustScore != null ? Math.round(item.analytics.trustScore) : '-';
      row.trend =
        item.analytics?.trendingScore != null ? item.analytics.trendingScore.toFixed(2) : '-';
      row.dist = item.analytics?.distributionScore ?? '-';
      row.holders =
        item.analytics?.holderCount != null ? item.analytics.holderCount.toLocaleString() : '-';
    }

    if (hasBalance) {
      row['bal$'] = moneyToNum(item.balance?.quote?.totalBalance)?.toFixed(2) ?? '-';
    }

    return row;
  });

  console.table(rows);

  if (result.meta.total > result.meta.offset + result.items.length) {
    const nextOffset = result.meta.offset + result.items.length;
    console.log(
      `${result.meta.total - nextOffset} more — set pagination.offset to ${nextOffset} for the next page\n`
    );
  }
}

async function main() {
  const finalRequest = { ...request };

  if (finalRequest.filters?.hasBalance || finalRequest.includes?.balance) {
    if (accountContext) {
      finalRequest.accountContext = accountContext;
    } else {
      console.warn('\n⚠  Balance requested but no account context found.');
      console.warn(
        '   Add ASSET_LIST_TEST_ACCOUNT_CONTEXT to packages/services/.env to enable balances.'
      );
      console.warn('   Running without balance data...\n');
      if (finalRequest.includes?.balance) finalRequest.includes.balance = false;
      if (finalRequest.filters?.hasBalance) delete finalRequest.filters.hasBalance;
    }
  }

  console.log('\n📋 Request:');
  console.log(
    JSON.stringify(finalRequest, (_, v) => (v === undefined ? '__undefined__' : v), 2).replace(
      /"__undefined__"/g,
      'undefined'
    )
  );

  const { AssetListService } = await import('@leather.io/services');

  const container = new Container({ autobind: true, defaultScope: 'Singleton' });
  container.bind(Types.Environment).toConstantValue({ environment: 'staging' });
  container.bind(Types.SettingsService).to(TestSettingsService).inSingletonScope();
  container.bind(Types.CacheService).to(InMemoryCacheService).inSingletonScope();

  const service = container.get(AssetListService);

  console.log('\n⏳ Fetching...');
  const start = performance.now();
  const result = await service.getAssetList(finalRequest);
  const duration = Math.round(performance.now() - start);
  console.log(`✅ Done in ${duration}ms`);

  printResults(result);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  if (err.stack) console.error(err.stack.split('\n').slice(0, 5).join('\n'));
  process.exit(1);
});
