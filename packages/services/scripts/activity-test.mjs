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
const walkAll = args.includes('--all');
const txidsMode = args.includes('--txids');
const limitArg = args.find(a => a.startsWith('--limit='))?.split('=')[1];
const pagesArg = args.find(a => a.startsWith('--pages='))?.split('=')[1];
const assetArg = args.find(a => a.startsWith('--asset='))?.split('=')[1];

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
    const txShort = a.txid?.slice(0, 12) + '…';
    const proto = a.protocol ? ` [${a.protocol}]` : '';
    const contractInfo = a.contract
      ? a.contract.type === 'call'
        ? ` ${a.contract.functionName}()`
        : ` deploy ${a.contract.contractId}`
      : '';
    const counterparty = a.counterparty ? ` ↔ ${truncateAddress(a.counterparty)}` : '';

    const fee = formatAmount(a.fee);
    const height = a.blockHeight ?? '-';
    console.log(
      `  ${time} | ${a.status.padEnd(7)} | ${a.chain.padEnd(7)} | ${(a.initiatedByUser ? 'OUT' : 'IN').padEnd(3)} | ${a.action.padEnd(16)} | blk ${String(height).padEnd(8)} | fee ${fee} | ${txShort}${proto}${contractInfo}${counterparty}`
    );

    for (const bc of a.balanceChanges) {
      const amount = formatAmount(bc.amount?.crypto);
      const quote = formatQuote(bc.amount?.quote);
      console.log(
        `    ${bc.direction.padEnd(8)} ${amount} ${bc.asset?.symbol ?? ''}${quote !== '-' ? ` (${quote})` : ''}`
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
  const txs = await btcService.getAccountTransactions(account, { page: 1, pageSize: 1000 });
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

function parseAssetId(raw) {
  const idx = raw.indexOf(':');
  if (idx === -1) return { protocol: raw, id: '' };
  return { protocol: raw.slice(0, idx), id: raw.slice(idx + 1) };
}

async function runActivityByAsset(service, account, raw) {
  const assetId = parseAssetId(raw);
  console.log(
    `\n--- Activity by asset: protocol=${assetId.protocol} id=${assetId.id || '(none)'} ---`
  );

  const start = performance.now();
  const items = await service.getActivityByAssetId(account, assetId);
  const duration = Math.round(performance.now() - start);
  console.log(`  ${items.length} items (${duration}ms)`);

  if (rawMode) console.log(JSON.stringify(items, null, 2));
  else logActivityDetailed(items);

  let pendingAfterConfirmed = 0;
  let seenConfirmed = false;
  let assetMismatches = 0;
  const isNative = assetId.protocol === 'nativeBtc' || assetId.protocol === 'nativeStx';
  for (const a of items) {
    if (a.status === 'pending' && seenConfirmed) pendingAfterConfirmed++;
    if (a.status !== 'pending') seenConfirmed = true;
    if (assetId.protocol === 'nativeBtc') {
      if (a.chain !== 'bitcoin') assetMismatches++;
    } else if (a.status !== 'pending') {
      const matches = a.balanceChanges.some(bc =>
        assetId.protocol === 'sip10'
          ? bc.asset.assetId === assetId.id
          : isNative && bc.asset.symbol === assetId.id
      );
      if (!matches) assetMismatches++;
    }
  }

  console.log(`\n  Invariants:`);
  console.log(
    `    Pending above confirmed:  ${pendingAfterConfirmed} ${pendingAfterConfirmed === 0 ? '✓' : '✗'}`
  );
  console.log(
    `    Confirmed match asset:    ${assetMismatches} mismatch ${assetMismatches === 0 ? '✓' : '✗'}`
  );

  console.log('\n' + '='.repeat(60));
  console.log('Done');
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
  console.log(`Page size: ${limitArg ?? 50} | Max pages: ${walkAll ? 'all' : (pagesArg ?? 5)}`);
  console.log('='.repeat(60));

  if (assetArg) {
    await runActivityByAsset(service, account, assetArg);
    return;
  }

  if (diagMode) {
    await runDiagnostics(container, account);
  }

  const pageLimit = limitArg ? Number(limitArg) : 50;
  const maxPages = walkAll ? Infinity : pagesArg ? Number(pagesArg) : 5;

  const allItems = [];
  const seenTxids = new Set();
  let duplicates = 0;
  let sizeViolations = 0;
  let cursor;
  let pageNum = 0;

  const start = performance.now();
  try {
    while (pageNum < maxPages) {
      const { items, nextCursor, hasMore } = await service.getActivity({
        account,
        limit: pageLimit,
        cursor,
      });
      pageNum++;

      console.log(`\n--- Page ${pageNum} | ${items.length} items | hasMore=${hasMore} ---`);
      if (hasMore && items.length !== pageLimit) {
        sizeViolations++;
        console.log(`  ⚠️  non-final page has ${items.length} items, expected ${pageLimit}`);
      }
      for (const a of items) {
        if (seenTxids.has(a.txid)) {
          duplicates++;
          console.log(`  ⚠️  DUPLICATE txid across pages: ${a.txid}`);
        }
        seenTxids.add(a.txid);
      }

      if (rawMode) console.log(JSON.stringify(items, null, 2));
      else logActivityDetailed(items);

      allItems.push(...items);

      if (nextCursor) {
        console.log(
          `  → cursor: afterKey=${nextCursor.afterKey?.slice(0, 24)}… stacksTxPageToken=${nextCursor.stacksTxPageToken ?? 'null'} stacksTxDone=${nextCursor.stacksTxDone}`
        );
      }
      if (!hasMore || !nextCursor) break;
      cursor = nextCursor;
    }
    const duration = Math.round(performance.now() - start);

    // Confirmed items must be strictly newest-first; pending sit on top and are exempt.
    const confirmed = allItems.filter(a => a.status !== 'pending');
    let orderViolations = 0;
    for (let i = 1; i < confirmed.length; i++) {
      if (confirmed[i].timestamp > confirmed[i - 1].timestamp) orderViolations++;
    }

    const chains = new Map();
    const actions = new Map();
    const statuses = new Map();
    for (const a of allItems) {
      chains.set(a.chain, (chains.get(a.chain) ?? 0) + 1);
      statuses.set(a.status, (statuses.get(a.status) ?? 0) + 1);
      actions.set(a.action, (actions.get(a.action) ?? 0) + 1);
    }

    console.log(`\n--- Summary (${duration}ms, ${pageNum} pages) ---`);
    console.log(`  Total items: ${allItems.length}`);
    console.log(`  Chains: ${[...chains.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
    console.log(`  Statuses: ${[...statuses.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
    console.log(`  Actions: ${[...actions.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
    console.log(`\n  Invariants:`);
    console.log(`    Duplicate txids across pages: ${duplicates} ${duplicates === 0 ? '✓' : '✗'}`);
    console.log(
      `    Non-final pages off-size:     ${sizeViolations} ${sizeViolations === 0 ? '✓' : '✗'}`
    );
    console.log(
      `    Confirmed order violations:   ${orderViolations} ${orderViolations === 0 ? '✓' : '✗'}`
    );

    if (txidsMode) {
      console.log('--- TXID SEQUENCE ---');
      for (const a of allItems) console.log(`TXID ${a.txid}`);
    }
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    console.error(`\n--- Activity FAILED (${duration}ms, page ${pageNum + 1}) ---`);
    console.error(`  ERROR: ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(0, 6).join('\n'));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Done');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
