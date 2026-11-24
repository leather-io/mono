import type { InfiniteData } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { BlockchainActivity } from '@leather.io/models';
import type { ActivityResponse } from '@leather.io/services';

import { isActivityFeedTailEmpty } from './blockchain-activity.query-config';

const activity: BlockchainActivity = {
  timestamp: 0,
  txid: '0x1',
  status: 'success',
  chain: 'stacks',
  initiatedByUser: false,
  action: 'send',
  balanceChanges: [],
};

function feed(...pages: ActivityResponse[]): InfiniteData<ActivityResponse> {
  return { pages, pageParams: pages.map(() => null) };
}

describe(isActivityFeedTailEmpty.name, () => {
  it('is true when the last page is empty but more pages remain', () => {
    expect(isActivityFeedTailEmpty(feed({ items: [], nextCursor: null, hasMore: true }))).toBe(
      true
    );
  });

  it('is true when an empty page follows loaded pages', () => {
    expect(
      isActivityFeedTailEmpty(
        feed(
          { items: [activity], nextCursor: null, hasMore: true },
          { items: [], nextCursor: null, hasMore: true }
        )
      )
    ).toBe(true);
  });

  it('is false when the last page has items', () => {
    expect(
      isActivityFeedTailEmpty(feed({ items: [activity], nextCursor: null, hasMore: true }))
    ).toBe(false);
  });

  it('is false when pagination is exhausted', () => {
    expect(isActivityFeedTailEmpty(feed({ items: [], nextCursor: null, hasMore: false }))).toBe(
      false
    );
  });

  it('is false without pages', () => {
    expect(isActivityFeedTailEmpty(feed())).toBe(false);
  });
});
