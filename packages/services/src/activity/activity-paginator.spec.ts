import { describe, expect, it } from 'vitest';

import {
  type ActivitySourceCursor,
  type ActivitySourceItem,
  type ActivitySourcePage,
  type ActivitySources,
  compareActivitySourceNewestFirst,
  getActivitySourcePage,
} from './activity-paginator';

function stx(timestamp: number): ActivitySourceItem {
  return stxTagged(timestamp, String(timestamp));
}

function stxTagged(timestamp: number, tag: string): ActivitySourceItem {
  return {
    txid: `stx-${tag}`,
    chain: 'stacks',
    timestamp,
    raw: {
      transaction: {
        tx_id: `stx-${timestamp}`,
        sender: { address: 'SP000000000000000000002Q6VF78', nonce: 0 },
        sponsor: null,
        fee_rate: '0',
        block: { height: 0, hash: '0x', index_hash: '0x', time: timestamp, tx_index: 0 },
        bitcoin_block: { height: 0, time: timestamp },
        status: 'success',
        type: 'token_transfer',
        token_transfer: { recipient: 'SP000000000000000000002Q6VF78', amount: '0', memo: null },
      },
      involvement: 'sender',
      balance_changes: { stx: { sent: '0', received: '0', net: '0' } },
      affected_balances: { stx: true, ft: false, nft: false },
    },
  };
}

function btc(timestamp: number): ActivitySourceItem {
  return {
    txid: `btc-${timestamp}`,
    chain: 'bitcoin',
    timestamp,
    raw: { txid: `btc-${timestamp}`, vin: [], vout: [] },
  };
}

function makeSources(
  stxAll: ActivitySourceItem[],
  btcAll: ActivitySourceItem[],
  stacksTxPageSize: number
): ActivitySources {
  const stxSorted = [...stxAll].sort(compareActivitySourceNewestFirst);
  return {
    fetchAllBtcTx() {
      return Promise.resolve([...btcAll]);
    },
    fetchStacksTxPage(cursor: string | null) {
      const offset = cursor === null ? 0 : Number(cursor);
      const items = stxSorted.slice(offset, offset + stacksTxPageSize);
      const nextOffset = offset + stacksTxPageSize;
      return Promise.resolve({
        items,
        currentCursor: cursor,
        nextCursor: nextOffset < stxSorted.length ? String(nextOffset) : null,
      });
    },
  };
}

function makeExplicitPagedSources(
  stacksPages: ActivitySourceItem[][],
  btcAll: ActivitySourceItem[]
): ActivitySources {
  return {
    fetchAllBtcTx() {
      return Promise.resolve([...btcAll]);
    },
    fetchStacksTxPage(cursor: string | null) {
      const index = cursor === null ? 0 : Number(cursor);
      return Promise.resolve({
        items: [...(stacksPages[index] ?? [])],
        currentCursor: cursor,
        nextCursor: index + 1 < stacksPages.length ? String(index + 1) : null,
      });
    },
  };
}

async function collectPages(
  sources: ActivitySources,
  limit: number
): Promise<ActivitySourcePage[]> {
  const pages: ActivitySourcePage[] = [];
  let cursor: ActivitySourceCursor | undefined;
  for (let guard = 0; guard < 1000; guard++) {
    const page = await getActivitySourcePage(sources, { limit, cursor });
    pages.push(page);
    if (page.nextCursor === null) return pages;
    cursor = page.nextCursor;
  }
  throw new Error('pagination did not terminate');
}

function flatten(pages: ActivitySourcePage[]): ActivitySourceItem[] {
  return pages.flatMap(page => page.items);
}

function txids(items: ActivitySourceItem[]): string[] {
  return items.map(item => item.txid);
}

function expectFixedPageSize(pages: ActivitySourcePage[], limit: number): void {
  pages.forEach((page, index) => {
    const isLast = index === pages.length - 1;
    if (isLast) expect(page.items.length).toBeLessThanOrEqual(limit);
    else expect(page.items.length).toBe(limit);
  });
}

describe('getActivitySourcePage', () => {
  it('emits the exact newest-first merge of both chains, no gaps or duplicates', async () => {
    const stxAll = [100, 95, 90, 70, 50, 30, 10].map(stx);
    const btcAll = [98, 60, 55, 52, 48, 45, 20].map(btc);
    const expected = [...stxAll, ...btcAll].sort(compareActivitySourceNewestFirst);

    const pages = await collectPages(makeSources(stxAll, btcAll, 3), 4);

    expect(txids(flatten(pages))).toEqual(txids(expected));
    expectFixedPageSize(pages, 4);
  });

  it('caps every page at the requested limit when Bitcoin is dense above sparse Stacks', async () => {
    const stxAll = [1000, 200].map(stx);
    const btcAll = Array.from({ length: 120 }, (_, i) => btc(999 - i));
    const expected = [...stxAll, ...btcAll].sort(compareActivitySourceNewestFirst);

    const pages = await collectPages(makeSources(stxAll, btcAll, 50), 25);

    expect(txids(flatten(pages))).toEqual(txids(expected));
    expectFixedPageSize(pages, 25);
  });

  it('resumes correctly across many tiny pages', async () => {
    const stxAll = [200, 150, 140, 100, 60].map(stx);
    const btcAll = [180, 145, 142, 141, 90, 40].map(btc);
    const expected = [...stxAll, ...btcAll].sort(compareActivitySourceNewestFirst);

    const pages = await collectPages(makeSources(stxAll, btcAll, 2), 1);

    expect(txids(flatten(pages))).toEqual(txids(expected));
    expectFixedPageSize(pages, 1);
  });

  it('emits Bitcoin older than the last Stacks tx in the tail', async () => {
    const stxAll = [100, 90].map(stx);
    const btcAll = [80, 70, 60, 50, 40, 30, 20, 10].map(btc);
    const expected = [...stxAll, ...btcAll].sort(compareActivitySourceNewestFirst);

    const pages = await collectPages(makeSources(stxAll, btcAll, 5), 3);

    expect(txids(flatten(pages))).toEqual(txids(expected));
    expectFixedPageSize(pages, 3);
  });

  it('returns only Bitcoin when there are no Stacks transactions', async () => {
    const btcAll = [90, 60, 30, 20, 10].map(btc);
    const expected = [...btcAll].sort(compareActivitySourceNewestFirst);

    const pages = await collectPages(makeSources([], btcAll, 5), 2);

    expect(txids(flatten(pages))).toEqual(txids(expected));
    expectFixedPageSize(pages, 2);
  });

  it('returns an empty page when both chains are empty', async () => {
    const page = await getActivitySourcePage(makeSources([], [], 5), { limit: 50 });

    expect(page.items).toEqual([]);
    expect(page.nextCursor).toBeNull();
  });

  it('does not drop same-timestamp Stacks txs split across source pages in non-key order', async () => {
    const tiedC = stxTagged(100, 'c');
    const tiedA = stxTagged(100, 'a');
    const tiedZ = stxTagged(100, 'z');
    const stacksPages = [
      [stx(120), tiedC, tiedA],
      [tiedZ, stx(90)],
    ];
    const expected = [stx(120), tiedC, tiedA, tiedZ, stx(90)].sort(
      compareActivitySourceNewestFirst
    );

    for (const limit of [1, 2, 3, 4]) {
      const pages = await collectPages(makeExplicitPagedSources(stacksPages, []), limit);
      expect(txids(flatten(pages))).toEqual(txids(expected));
    }
  });

  it('holds back Bitcoin at the frontier timestamp until the Stacks tie group is complete', async () => {
    const stacksPages = [
      [stx(120), stxTagged(100, 'c')],
      [stxTagged(100, 'z'), stx(90)],
    ];
    const btcAll = [btc(100), btc(95)];
    const expected = [
      stx(120),
      stxTagged(100, 'c'),
      stxTagged(100, 'z'),
      btc(100),
      btc(95),
      stx(90),
    ].sort(compareActivitySourceNewestFirst);

    for (const limit of [1, 2, 3]) {
      const pages = await collectPages(makeExplicitPagedSources(stacksPages, btcAll), limit);
      expect(txids(flatten(pages))).toEqual(txids(expected));
    }
  });

  it('stays strictly descending across a Bitcoin-dense window', async () => {
    const stxAll = [200, 150, 140, 100, 60].map(stx);
    const btcAll = [180, 145, 142, 141, 90, 40].map(btc);

    const result = flatten(await collectPages(makeSources(stxAll, btcAll, 2), 3));

    for (let i = 1; i < result.length; i++) {
      expect(compareActivitySourceNewestFirst(result[i - 1], result[i])).toBeLessThan(0);
    }
    expect(result).toHaveLength(stxAll.length + btcAll.length);
  });
});
