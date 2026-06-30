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
  readonly stxToken: string | null;
  readonly stxDone: boolean;
}

export interface ActivitySourcePage {
  readonly items: ActivitySourceItem[];
  readonly nextCursor: ActivitySourceCursor | null;
}

export interface ActivitySources {
  fetchStxPage(cursor: string | null): Promise<{
    items: ActivitySourceItem[];
    currentCursor: string | null;
    nextCursor: string | null;
  }>;
  fetchAllBtc(): Promise<ActivitySourceItem[]>;
}

const TIMESTAMP_KEY_WIDTH = 16;
const stxPageFetchLimit = 20;

// Strict total order so a cursor can resume at an exact boundary with no gaps or duplicates.
function activitySourceItemKey(item: ActivitySourceItem): string {
  return `${String(item.timestamp).padStart(TIMESTAMP_KEY_WIDTH, '0')}:${item.chain}:${item.txid}`;
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

interface AccumulatedStxPage {
  readonly current: string | null;
  readonly items: ActivitySourceItem[];
}

function countItems(pages: AccumulatedStxPage[]): number {
  return pages.reduce((total, page) => total + page.items.length, 0);
}

function lowestKey(pages: AccumulatedStxPage[]): string | null {
  let lowest: string | null = null;
  for (const page of pages) {
    for (const item of page.items) {
      const key = activitySourceItemKey(item);
      if (lowest === null || key < lowest) lowest = key;
    }
  }
  return lowest;
}

function resumeStxToken(
  boundaryPage: AccumulatedStxPage | undefined,
  stxExhausted: boolean,
  lastNext: string | null
): string | null {
  if (boundaryPage !== undefined) return boundaryPage.current;
  if (stxExhausted) return null;
  return lastNext;
}

// Bitcoin transactions are fetched whole (the endpoint has no page-size limit), so Bitcoin is
// always complete in hand. Stacks paginates, so it drives the time window and Bitcoin fills it.
// Because Bitcoin is complete, the relative density of the two chains can never drop an item.
export async function getActivitySourcePage(
  sources: ActivitySources,
  { limit, cursor }: { limit: number; cursor?: ActivitySourceCursor }
): Promise<ActivitySourcePage> {
  const afterKey = cursor?.afterKey ?? null;
  const allBtc = sortNewestFirst(await sources.fetchAllBtc());
  const btcRemaining =
    afterKey === null ? allBtc : allBtc.filter(item => activitySourceItemKey(item) < afterKey);

  if (cursor?.stxDone) {
    return emitBitcoinTail(btcRemaining, limit);
  }

  const stxPages: AccumulatedStxPage[] = [];
  let token = cursor?.stxToken ?? null;
  let lastNext: string | null = null;
  let stxExhausted = false;

  for (let fetched = 0; fetched < stxPageFetchLimit; fetched++) {
    const page = await sources.fetchStxPage(token);
    const fresh =
      afterKey === null
        ? page.items
        : page.items.filter(item => activitySourceItemKey(item) < afterKey);
    stxPages.push({ current: page.currentCursor, items: fresh });
    lastNext = page.nextCursor;
    if (page.nextCursor === null) {
      stxExhausted = true;
      break;
    }
    const frontier = lowestKey(stxPages);
    const safeBtc =
      frontier === null
        ? 0
        : btcRemaining.filter(item => activitySourceItemKey(item) >= frontier).length;
    if (countItems(stxPages) + safeBtc >= limit) break;
    token = page.nextCursor;
  }

  const stxItems = stxPages.flatMap(page => page.items);
  if (stxItems.length === 0) {
    return emitBitcoinTail(btcRemaining, limit);
  }

  const frontier = lowestKey(stxPages);
  const safeBtc =
    stxExhausted || frontier === null
      ? btcRemaining
      : btcRemaining.filter(item => activitySourceItemKey(item) >= frontier);
  const merged = sortNewestFirst([...stxItems, ...safeBtc]);
  const items = merged.slice(0, limit);
  const lastKey = activitySourceItemKey(items[items.length - 1]);

  const boundaryPage = stxPages.find(page =>
    page.items.some(item => activitySourceItemKey(item) < lastKey)
  );
  const stxMore = boundaryPage !== undefined || !stxExhausted;
  const bitcoinTailRemains = btcRemaining.some(item => activitySourceItemKey(item) < lastKey);

  if (!stxMore && !bitcoinTailRemains) {
    return { items, nextCursor: null };
  }

  return {
    items,
    nextCursor: {
      afterKey: lastKey,
      stxToken: resumeStxToken(boundaryPage, stxExhausted, lastNext),
      stxDone: !stxMore,
    },
  };
}

function emitBitcoinTail(btcRemaining: ActivitySourceItem[], limit: number): ActivitySourcePage {
  const items = btcRemaining.slice(0, limit);
  if (items.length === 0) return { items: [], nextCursor: null };
  if (btcRemaining.length <= limit) return { items, nextCursor: null };
  return {
    items,
    nextCursor: {
      afterKey: activitySourceItemKey(items[items.length - 1]),
      stxToken: null,
      stxDone: true,
    },
  };
}
