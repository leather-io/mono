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

const args = process.argv.slice(2);
const rawMode = args.includes('--raw');
const diagMode = args.includes('--diag');
const filterChain = args.find(a => a.startsWith('--chain='))?.split('=')[1];
const filterAsset = args.find(a => a.startsWith('--asset='))?.split('=')[1];
const filterProtocol = args.find(a => a.startsWith('--protocol='))?.split('=')[1];
const limitArg = args.find(a => a.startsWith('--limit='))?.split('=')[1];
const offsetArg = args.find(a => a.startsWith('--offset='))?.split('=')[1];

const Types = {
  Environment: Symbol.for('Environment'),
  SettingsService: Symbol.for('SettingsService'),
  CacheService: Symbol.for('CacheService'),
};

class InMemoryCacheService extends HttpCacheService {
  cache = new Map();

  async fetchWithCacheInternal(key, fetchFn, _options) {
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

const accountContextJson = process.env.TEST_ACCOUNT_CONTEXT;
const accountContext = accountContextJson ? JSON.parse(accountContextJson) : null;

if (!accountContext) {
  console.error(
    'ERROR: TEST_ACCOUNT_CONTEXT not set.\n' +
      'Add it to packages/services/.env as a JSON string with account addresses.\n' +
      'Example: TEST_ACCOUNT_CONTEXT=\'{"account":{"id":{"fingerprint":"...","accountIndex":0},"bitcoin":{...},"stacks":{"stxAddress":"..."}}}\''
  );
  process.exit(1);
}

function formatTimestamp(ts) {
  if (!ts) return '-';
  return new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19);
}

function formatAmount(money) {
  if (!money) return '-';
  const amt = Number(money.amount);
  const decimals = money.decimals ?? 0;
  const value = decimals > 0 ? amt / 10 ** decimals : amt;
  return `${value} ${money.symbol}`;
}

function formatQuote(money) {
  if (!money) return '-';
  const amt = Number(money.amount);
  const decimals = money.decimals ?? 0;
  const value = decimals > 0 ? amt / 10 ** decimals : amt;
  if (value === 0) return '-';
  return `$${value.toFixed(2)}`;
}

function truncateAddress(addr) {
  if (!addr || addr.length <= 16) return addr ?? '-';
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function logActivityDetailed(activities) {
  for (const a of activities) {
    const time = formatTimestamp(a.timestamp);
    const txShort = a.txid?.slice(0, 16) + '...';
    const contractInfo = a.contract
      ? ` | ${a.contract.type}${a.contract.protocol ? ` [${a.contract.protocol}${a.contract.action ? `:${a.contract.action}` : ''}]` : ''}`
      : '';

    const fee = formatAmount(a.fee);
    const height = a.blockHeight ?? '-';
    console.log(
      `  ${time} | ${a.status.padEnd(7)} | ${a.chain.padEnd(7)} | ${a.initiatedByUser ? 'SENT' : 'RECV'} | blk ${String(height).padEnd(7)} | fee ${fee} | ${txShort}${contractInfo}`
    );

    for (const e of a.events) {
      const amount = formatAmount(e.amount?.crypto);
      const quote = formatQuote(e.amount?.quote);
      const counterparty = e.counterparty ? truncateAddress(e.counterparty) : '';
      console.log(
        `    ${e.action.padEnd(8)} ${amount}${quote !== '-' ? ` (${quote})` : ''}${counterparty ? ` ↔ ${counterparty}` : ''}`
      );
    }
  }
}

function countUserEvents(rawEvents, stxAddress) {
  let total = 0;
  let matched = 0;
  for (const event of rawEvents) {
    total++;
    const asset = event.asset ?? event.stx_lock_event ?? {};
    const sender = asset.sender ?? asset.locked_address;
    const recipient = asset.recipient;
    if (sender === stxAddress || recipient === stxAddress || asset.locked_address === stxAddress) {
      matched++;
    }
  }
  return { total, matched };
}

async function fetchHiroAllPages(url, limit, stopAfter) {
  const axios = (await import('axios')).default;
  const baseUrl = 'https://api.hiro.so';
  const firstRes = await axios.get(`${baseUrl}${url}?limit=${limit}&offset=0`, {
    headers: { 'X-Partner': 'Leather' },
  });
  const total = firstRes.data.total;
  const totalPages = Math.ceil(total / limit);
  const pagesToFetch = Math.min(totalPages, stopAfter);
  const results = [...firstRes.data.results];

  if (pagesToFetch > 1) {
    const remaining = await Promise.all(
      Array.from({ length: pagesToFetch - 1 }, (_, i) =>
        axios.get(`${baseUrl}${url}?limit=${limit}&offset=${(i + 1) * limit}`, {
          headers: { 'X-Partner': 'Leather' },
        })
      )
    );
    for (const res of remaining) results.push(...res.data.results);
  }

  return { results, total, pagesFetched: pagesToFetch };
}

async function runBtcDiagnostics(container, account) {
  const { BitcoinTransactionsService } = await import('@leather.io/services');
  const btcService = container.get(BitcoinTransactionsService);

  console.log('\n--- Bitcoin Transaction Diagnostics ---');

  const start = performance.now();
  const txs = await btcService.getAccountTransactions(account);
  const fetchMs = Math.round(performance.now() - start);

  console.log(`  Fetch time: ${fetchMs}ms`);
  console.log(`  Transactions: ${txs.length}`);

  let selfTransfers = 0;
  let sendsWithChange = 0;
  let pureReceives = 0;
  let emptyEventTxs = 0;

  for (const tx of txs) {
    const hasOwnedInput = tx.vin.some(v => v.owned);
    const hasOwnedOutput = tx.vout.some(v => v.owned);
    const allOutputsOwned = tx.vout.every(v => v.owned);
    const nonOwnedOutputs = tx.vout.filter(v => !v.owned);

    if (hasOwnedInput && allOutputsOwned) {
      selfTransfers++;
      const totalOut = tx.vout.reduce((sum, v) => sum + Number(v.value), 0);
      console.log(
        `    SELF-TRANSFER: ${tx.txid.slice(0, 16)}... | ${tx.vout.length} vouts, all owned, total: ${totalOut} sats`
      );
      for (const v of tx.vout) {
        console.log(`      vout[${v.n}]: ${v.address} | ${v.value} sats | path: ${v.path ?? '-'}`);
      }
    } else if (hasOwnedInput && hasOwnedOutput) {
      sendsWithChange++;
    } else if (!hasOwnedInput && hasOwnedOutput) {
      pureReceives++;
    }

    if (hasOwnedInput && nonOwnedOutputs.length === 0) {
      emptyEventTxs++;
    }
  }

  console.log(`  Self-transfers (all outputs owned): ${selfTransfers}`);
  console.log(`  Sends with change: ${sendsWithChange}`);
  console.log(`  Pure receives: ${pureReceives}`);
  console.log(`  Txs that would produce empty events: ${emptyEventTxs}`);
}

async function runDiagnostics(container, account) {
  if (account.bitcoin?.nativeSegwitDescriptor) {
    await runBtcDiagnostics(container, account);
  }

  const stxAddress = account.stacks?.stxAddress;
  if (!stxAddress) {
    console.log('  No STX address, skipping Stacks diagnostics');
    return;
  }

  console.log('\n--- Stacks Event Diagnostics ---');

  const start = performance.now();
  const [txData, eventData] = await Promise.all([
    fetchHiroAllPages(`/extended/v2/addresses/${stxAddress}/transactions`, 50, 20),
    fetchHiroAllPages(`/extended/v1/address/${stxAddress}/assets`, 100, 20),
  ]);
  const fetchMs = Math.round(performance.now() - start);
  const txs = txData.results;
  const txEvents = eventData.results;

  console.log(`  Fetch time: ${fetchMs}ms`);
  console.log(
    `  Transactions: ${txs.length} (${txData.pagesFetched} pages, ${txData.total} total on-chain)`
  );
  console.log(
    `  Raw events: ${txEvents.length} (${eventData.pagesFetched} pages, ${eventData.total} total on-chain)`
  );

  const eventsByTxId = new Map();
  for (const event of txEvents) {
    if (!eventsByTxId.has(event.tx_id)) eventsByTxId.set(event.tx_id, []);
    eventsByTxId.get(event.tx_id).push(event);
  }

  const txsWithEvents = eventsByTxId.size;
  const txsWithoutEvents = txs.length - txsWithEvents;

  let totalRawEvents = 0;
  let userMatchedEvents = 0;
  for (const [, events] of eventsByTxId) {
    const { total, matched } = countUserEvents(events, stxAddress);
    totalRawEvents += total;
    userMatchedEvents += matched;
  }

  const wastePercent =
    totalRawEvents > 0
      ? Math.round(((totalRawEvents - userMatchedEvents) / totalRawEvents) * 100)
      : 0;

  console.log(`  Txs with events: ${txsWithEvents}`);
  console.log(`  Txs without events: ${txsWithoutEvents}`);
  console.log(`  Total raw events: ${totalRawEvents}`);
  console.log(`  Events matching user address: ${userMatchedEvents}`);
  console.log(
    `  Intermediate/irrelevant events: ${totalRawEvents - userMatchedEvents} (${wastePercent}% waste)`
  );

  const txTypes = new Map();
  for (const t of txs) {
    const type = t.tx?.tx_type ?? 'unknown';
    txTypes.set(type, (txTypes.get(type) ?? 0) + 1);
  }
  console.log(`  Tx types: ${[...txTypes.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);

  const topEventTxs = [...eventsByTxId.entries()]
    .map(([txid, events]) => ({ txid, count: events.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  if (topEventTxs.length > 0) {
    console.log(`  Top 5 txs by event count:`);
    for (const t of topEventTxs) {
      console.log(`    ${t.txid.slice(0, 16)}... → ${t.count} events`);
    }
  }
}

async function main() {
  const { BlockchainActivityService } = await import('@leather.io/services');

  const container = new Container({ autobind: true, defaultScope: 'Singleton' });
  container.bind(Types.Environment).toConstantValue({ environment: 'staging' });
  container.bind(Types.SettingsService).to(TestSettingsService).inSingletonScope();
  container.bind(Types.CacheService).to(InMemoryCacheService).inSingletonScope();

  const service = container.get(BlockchainActivityService);
  const account = accountContext.account;

  console.log('\nBlockchainActivityService Test');
  console.log('='.repeat(60));
  console.log(`BTC: ${account.bitcoin?.zeroIndexNativeSegwitPayerAddress ?? 'none'}`);
  console.log(`STX: ${account.stacks?.stxAddress ?? 'none'}`);
  console.log(`Mode: ${rawMode ? 'raw JSON' : diagMode ? 'diagnostics' : 'formatted'}`);
  if (filterChain) console.log(`Chain filter: ${filterChain}`);
  if (filterAsset) console.log(`Asset filter: ${filterAsset}`);
  if (filterProtocol) console.log(`Protocol filter: ${filterProtocol}`);
  if (limitArg) console.log(`Limit: ${limitArg}`);
  if (offsetArg) console.log(`Offset: ${offsetArg}`);
  console.log('='.repeat(60));

  if (diagMode) {
    await runDiagnostics(container, account);
  }

  const filter = {};
  if (filterAsset) {
    filter.asset = {
      protocol: 'sip10',
      chain: 'stacks',
      symbol: '',
      assetId: filterAsset,
      decimals: 0,
      name: '',
      imageUrl: '',
    };
  } else if (filterProtocol) {
    filter.protocol = filterProtocol;
  } else if (filterChain) {
    filter.chain = filterChain;
  }

  const request = { account };
  if (Object.keys(filter).length > 0) request.filter = filter;
  if (limitArg) {
    request.pagination = {
      limit: Number(limitArg),
      offset: Number(offsetArg ?? 0),
    };
  }

  const start = performance.now();
  try {
    const { items, meta } = await service.getActivity(request);
    const duration = Math.round(performance.now() - start);

    console.log(`\n--- Activity (${duration}ms) ---`);
    console.log(
      `Showing: ${items.length} | Total: ${meta.total} | Offset: ${meta.offset} | Limit: ${meta.limit}`
    );

    if (items.length === 0) {
      console.log('  (no activity found)');
    } else if (rawMode) {
      console.log(JSON.stringify(items, null, 2));
    } else {
      const displayLimit = 30;
      logActivityDetailed(items.slice(0, displayLimit));
      if (items.length > displayLimit) {
        console.log(`  ... and ${items.length - displayLimit} more in this page`);
      }

      const chains = new Map();
      const actions = new Map();
      const statuses = new Map();
      for (const a of items) {
        chains.set(a.chain, (chains.get(a.chain) ?? 0) + 1);
        statuses.set(a.status, (statuses.get(a.status) ?? 0) + 1);
        for (const e of a.events) {
          actions.set(e.action, (actions.get(e.action) ?? 0) + 1);
        }
      }
      console.log(`\n  Summary:`);
      console.log(`    Chains: ${[...chains.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
      console.log(
        `    Statuses: ${[...statuses.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`
      );
      console.log(`    Actions: ${[...actions.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    console.error(`\n--- Activity FAILED (${duration}ms) ---`);
    console.error(`  ERROR: ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(0, 5).join('\n'));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Done');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
