import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { AccountAddresses, BlockchainActivity } from '@leather.io/models';

import { findCachedBlockchainActivityByTxid } from './blockchain-activity.query';

const addressA = 'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQAAAAAA';
const addressB = 'SM3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QBBBBBB';

function makeAccount(stxAddress: string): AccountAddresses {
  return {
    id: { fingerprint: `account-${stxAddress}`, accountIndex: 0 },
    stacks: { stxAddress },
  };
}

function makeActivity(txid: string, initiatedByUser = true): BlockchainActivity {
  return {
    timestamp: 1_700_000_000,
    txid,
    status: 'success',
    chain: 'stacks',
    initiatedByUser,
    action: 'send',
    balanceChanges: [],
  };
}

function feedKey(stxAddress: string) {
  return [
    'blockchain-activity-service--get-activity-infinite',
    { account: makeAccount(stxAddress), limit: 25 },
    'mainnet',
  ];
}

describe(findCachedBlockchainActivityByTxid.name, () => {
  it('finds an activity inside a cached infinite feed for the same account', () => {
    const queryClient = new QueryClient();
    const activity = makeActivity('0xabc123');
    queryClient.setQueryData(feedKey(addressA), {
      pages: [{ items: [makeActivity('0xother'), activity], nextCursor: null, hasMore: false }],
      pageParams: [null],
    });

    const found = findCachedBlockchainActivityByTxid(
      queryClient,
      makeAccount(addressA),
      '0xabc123'
    );
    expect(found?.activity).toEqual(activity);
    expect(found?.dataUpdatedAt).toBeGreaterThan(0);
  });

  it('finds an activity inside a cached plain activity response', () => {
    const queryClient = new QueryClient();
    const activity = makeActivity('0xdef456');
    queryClient.setQueryData(
      ['blockchain-activity-service--get-activity', { account: makeAccount(addressA), limit: 50 }],
      { items: [activity], nextCursor: null, hasMore: false }
    );

    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), '0xdef456')?.activity
    ).toEqual(activity);
  });

  it('finds an activity inside a cached by-asset-id list', () => {
    const queryClient = new QueryClient();
    const activity = makeActivity('0x123789');
    queryClient.setQueryData(
      ['blockchain-activity-service--get-activity-by-asset-id', makeAccount(addressA), 'stx'],
      [activity]
    );

    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), '0x123789')?.activity
    ).toEqual(activity);
  });

  it('matches txids regardless of 0x prefix and case', () => {
    const queryClient = new QueryClient();
    const activity = makeActivity('0xABCdef');
    queryClient.setQueryData(feedKey(addressA), {
      pages: [{ items: [activity], nextCursor: null, hasMore: false }],
      pageParams: [null],
    });

    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), 'abcDEF')?.activity
    ).toEqual(activity);
  });

  it('never reads another account cache, even for a matching txid', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(feedKey(addressB), {
      pages: [{ items: [makeActivity('0xshared')], nextCursor: null, hasMore: false }],
      pageParams: [null],
    });

    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), '0xshared')
    ).toBeUndefined();
  });

  it('matches nothing for the placeholder account used before the real account loads', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(feedKey(addressA), {
      pages: [{ items: [makeActivity('0xabc')], nextCursor: null, hasMore: false }],
      pageParams: [null],
    });

    expect(
      findCachedBlockchainActivityByTxid(
        queryClient,
        { id: { fingerprint: 'multisig:none', accountIndex: 0 } },
        '0xabc'
      )
    ).toBeUndefined();
  });

  it('returns each side of an internal transfer from its own account cache', () => {
    const queryClient = new QueryClient();
    const sendSide = makeActivity('0xinternal', true);
    const receiveSide = makeActivity('0xinternal', false);
    queryClient.setQueryData(feedKey(addressA), {
      pages: [{ items: [sendSide], nextCursor: null, hasMore: false }],
      pageParams: [null],
    });
    queryClient.setQueryData(feedKey(addressB), {
      pages: [{ items: [receiveSide], nextCursor: null, hasMore: false }],
      pageParams: [null],
    });

    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), '0xinternal')?.activity
    ).toEqual(sendSide);
    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressB), '0xinternal')?.activity
    ).toEqual(receiveSide);
  });

  it('prefers the freshest cache when several hold the txid', () => {
    const queryClient = new QueryClient();
    const stale = makeActivity('0xdup', true);
    const fresh = makeActivity('0xdup', false);
    queryClient.setQueryData(
      ['blockchain-activity-service--get-activity', { account: makeAccount(addressA), limit: 50 }],
      { items: [stale], nextCursor: null, hasMore: false },
      { updatedAt: 1_000 }
    );
    queryClient.setQueryData(
      feedKey(addressA),
      { pages: [{ items: [fresh], nextCursor: null, hasMore: false }], pageParams: [null] },
      { updatedAt: 2_000 }
    );

    const found = findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), '0xdup');
    expect(found?.activity).toEqual(fresh);
    expect(found?.dataUpdatedAt).toBe(2_000);
  });

  it('returns undefined when the txid is not cached', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(feedKey(addressA), {
      pages: [{ items: [makeActivity('0xaaa')], nextCursor: null, hasMore: false }],
      pageParams: [null],
    });

    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), '0xbbb')
    ).toBeUndefined();
  });

  it('returns undefined for an empty txid', () => {
    const queryClient = new QueryClient();
    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), '')
    ).toBeUndefined();
  });

  it('ignores caches under unrelated query keys', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      ['blockchain-activity-service--get-activity-by-tx-id', makeAccount(addressA), '0xccc'],
      { items: [makeActivity('0xccc')], nextCursor: null, hasMore: false }
    );

    expect(
      findCachedBlockchainActivityByTxid(queryClient, makeAccount(addressA), '0xccc')
    ).toBeUndefined();
  });
});
