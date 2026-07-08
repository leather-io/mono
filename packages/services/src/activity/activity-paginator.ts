import type { BitcoinTransaction } from '@leather.io/models';

import type { HiroPrincipalTransactionsResultItem } from '../infrastructure/api/hiro/hiro-stacks-api.types';

interface BitcoinActivitySourceItem {
  readonly chain: 'bitcoin';
  readonly txid: string;
  readonly timestamp: number;
  readonly raw: BitcoinTransaction;
}

interface StacksActivitySourceItem {
  readonly chain: 'stacks';
  readonly txid: string;
  readonly timestamp: number;
  readonly raw: HiroPrincipalTransactionsResultItem;
}

export type ActivitySourceItem = BitcoinActivitySourceItem | StacksActivitySourceItem;

export interface ActivitySourceCursor {
  readonly afterKey: string;
  readonly stacksTxPageToken: string | null;
  readonly stacksTxDone: boolean;
}

export interface ActivitySourcePage {
  readonly items: ActivitySourceItem[];
  readonly nextCursor: ActivitySourceCursor | null;
}

export interface ActivitySources {
  fetchStacksTxPage(cursor: string | null): Promise<{
    items: ActivitySourceItem[];
    currentCursor: string | null;
    nextCursor: string | null;
  }>;
  fetchAllBtcTx(): Promise<ActivitySourceItem[]>;
}

const timestampKeyWidth = 16;
const maxStacksTxPageFetches = 20;

// Strict total order so a cursor can resume at an exact boundary with no gaps or duplicates.
function activitySourceItemKey(item: ActivitySourceItem): string {
  return `${String(item.timestamp).padStart(timestampKeyWidth, '0')}:${item.chain}:${item.txid}`;
}

export function compareActivitySourceNewestFirst(
  a: ActivitySourceItem,
  b: ActivitySourceItem
): number {
  const ka = activitySourceItemKey(a);
  const kb = activitySourceItemKey(b);
  if (ka > kb) return -1;
  if (ka < kb) return 1;
  return 0;
}

function sortNewestFirst(items: ActivitySourceItem[]): ActivitySourceItem[] {
  return [...items].sort(compareActivitySourceNewestFirst);
}

interface AccumulatedStacksTxPage {
  readonly current: string | null;
  readonly items: ActivitySourceItem[];
}

function countNewerThan(pages: AccumulatedStacksTxPage[], timestamp: number): number {
  return pages.reduce(
    (total, page) => total + page.items.filter(item => item.timestamp > timestamp).length,
    0
  );
}

function lowestKey(pages: AccumulatedStacksTxPage[]): string | null {
  let lowest: string | null = null;
  for (const page of pages) {
    for (const item of page.items) {
      const key = activitySourceItemKey(item);
      if (lowest === null || key < lowest) lowest = key;
    }
  }
  return lowest;
}

interface StacksTxWindow {
  readonly pages: AccumulatedStacksTxPage[];
  readonly oldestFetchedTimestamp: number | null;
  readonly exhausted: boolean;
  readonly lastNext: string | null;
}

// Accumulates Stacks pages until the emit-safe region can fill a page or the stream ends.
// Safety is timestamp-based: txs in the same block share block.time, and the source pages
// ties in block order while the merge key orders them by txid, so a timestamp group is only
// safe to emit once a fetched page has moved strictly past it (the group is then complete —
// nothing that sorts inside it can arrive on a later page).
async function accumulateStacksTxWindow(
  sources: ActivitySources,
  afterKey: string | null,
  btcTxRemaining: ActivitySourceItem[],
  limit: number,
  startToken: string | null
): Promise<StacksTxWindow> {
  const pages: AccumulatedStacksTxPage[] = [];
  let token = startToken;
  let lastNext: string | null = null;
  let oldestFetchedTimestamp: number | null = null;

  for (let fetched = 0; fetched < maxStacksTxPageFetches; fetched++) {
    const page = await sources.fetchStacksTxPage(token);
    const fresh =
      afterKey === null
        ? page.items
        : page.items.filter(item => activitySourceItemKey(item) < afterKey);
    pages.push({ current: page.currentCursor, items: fresh });
    lastNext = page.nextCursor;
    const pageOldest = page.items[page.items.length - 1]?.timestamp;
    if (pageOldest !== undefined) oldestFetchedTimestamp = pageOldest;
    if (page.nextCursor === null) {
      return { pages, oldestFetchedTimestamp, exhausted: true, lastNext };
    }
    if (oldestFetchedTimestamp !== null) {
      const frontier = oldestFetchedTimestamp;
      const safeStacksTx = countNewerThan(pages, frontier);
      const safeBtcTx = btcTxRemaining.filter(item => item.timestamp > frontier).length;
      if (safeStacksTx + safeBtcTx >= limit) break;
    }
    token = page.nextCursor;
  }
  return { pages, oldestFetchedTimestamp, exhausted: false, lastNext };
}

// A single timestamp group larger than the entire fetch window: emit on the full-key order
// rather than stall (accepts the theoretical tie-order drop over making no progress).
function fallbackSafeItems(
  stacksTxItems: ActivitySourceItem[],
  btcTxRemaining: ActivitySourceItem[],
  pages: AccumulatedStacksTxPage[]
): ActivitySourceItem[] {
  const frontierKey = lowestKey(pages);
  if (frontierKey === null) return [...stacksTxItems, ...btcTxRemaining];
  return [
    ...stacksTxItems,
    ...btcTxRemaining.filter(item => activitySourceItemKey(item) >= frontierKey),
  ];
}

function resumeStacksTxPageToken(
  boundaryPage: AccumulatedStacksTxPage | undefined,
  stacksTxExhausted: boolean,
  lastNext: string | null
): string | null {
  if (boundaryPage !== undefined) return boundaryPage.current;
  if (stacksTxExhausted) return null;
  return lastNext;
}

// Emit-safety is timestamp-based (see accumulateStacksTxWindow): only items strictly newer
// than the oldest fetched Stacks timestamp are guaranteed complete, unless the stream ended.
function selectEmitSafeItems(
  window: StacksTxWindow,
  stacksTxItems: ActivitySourceItem[],
  btcTxRemaining: ActivitySourceItem[]
): ActivitySourceItem[] {
  const frontier = window.oldestFetchedTimestamp;
  function emitSafe(item: ActivitySourceItem): boolean {
    return window.exhausted || frontier === null || item.timestamp > frontier;
  }
  const tieSafeItems = [...stacksTxItems.filter(emitSafe), ...btcTxRemaining.filter(emitSafe)];
  if (tieSafeItems.length > 0) return tieSafeItems;
  return fallbackSafeItems(stacksTxItems, btcTxRemaining, window.pages);
}

// Resume state from the emitted boundary: a mid-page boundary re-reads that page's current
// token next call; null means the whole feed is drained.
function buildNextCursor(
  items: ActivitySourceItem[],
  window: StacksTxWindow,
  btcTxRemaining: ActivitySourceItem[]
): ActivitySourceCursor | null {
  const lastKey = activitySourceItemKey(items[items.length - 1]);
  const boundaryPage = window.pages.find(page =>
    page.items.some(item => activitySourceItemKey(item) < lastKey)
  );
  const stacksTxMore = boundaryPage !== undefined || !window.exhausted;
  const bitcoinTailRemains = btcTxRemaining.some(item => activitySourceItemKey(item) < lastKey);
  if (!stacksTxMore && !bitcoinTailRemains) return null;
  return {
    afterKey: lastKey,
    stacksTxPageToken: resumeStacksTxPageToken(boundaryPage, window.exhausted, window.lastNext),
    stacksTxDone: !stacksTxMore,
  };
}

// Bitcoin transactions are fetched whole (the endpoint has no page-size limit), so Bitcoin is
// always complete in hand. Stacks paginates, so it drives the time window and Bitcoin fills it.
// Because Bitcoin is complete, the relative density of the two chains can never drop an item.
export async function getActivitySourcePage(
  sources: ActivitySources,
  { limit, cursor }: { limit: number; cursor?: ActivitySourceCursor }
): Promise<ActivitySourcePage> {
  const afterKey = cursor?.afterKey ?? null;
  const allBtcTx = sortNewestFirst(await sources.fetchAllBtcTx());
  const btcTxRemaining =
    afterKey === null ? allBtcTx : allBtcTx.filter(item => activitySourceItemKey(item) < afterKey);

  if (cursor?.stacksTxDone) {
    return emitBitcoinTail(btcTxRemaining, limit);
  }

  const window = await accumulateStacksTxWindow(
    sources,
    afterKey,
    btcTxRemaining,
    limit,
    cursor?.stacksTxPageToken ?? null
  );
  const stacksTxItems = window.pages.flatMap(page => page.items);
  if (stacksTxItems.length === 0) {
    return emitBitcoinTail(btcTxRemaining, limit);
  }

  const merged = sortNewestFirst(selectEmitSafeItems(window, stacksTxItems, btcTxRemaining));
  const items = merged.slice(0, limit);
  return { items, nextCursor: buildNextCursor(items, window, btcTxRemaining) };
}

function emitBitcoinTail(btcTxRemaining: ActivitySourceItem[], limit: number): ActivitySourcePage {
  const items = btcTxRemaining.slice(0, limit);
  if (items.length === 0) return { items: [], nextCursor: null };
  if (btcTxRemaining.length <= limit) return { items, nextCursor: null };
  return {
    items,
    nextCursor: {
      afterKey: activitySourceItemKey(items[items.length - 1]),
      stacksTxPageToken: null,
      stacksTxDone: true,
    },
  };
}
