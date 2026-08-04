import { describe, expect, it } from 'vitest';

import { btcAsset } from '@leather.io/constants';
import type { BlockchainActivityItem } from '@leather.io/features';
import type { OnChainActivityStatus } from '@leather.io/models';

import { mergeSbtcDepositItems } from './activity-list.utils';

function createItem(
  txid: string,
  timestamp: number,
  status: OnChainActivityStatus = 'success'
): BlockchainActivityItem {
  return {
    activity: {
      txid,
      timestamp,
      status,
      chain: 'bitcoin',
      action: 'send',
      initiatedByUser: true,
      balanceChanges: [],
    },
    view: {
      key: `bitcoin:${txid}`,
      txid,
      timestamp,
      status,
      chain: 'bitcoin',
      action: 'send',
      avatar: { kind: 'single', asset: btcAsset },
      indicator: status === 'pending' ? 'pending' : 'sent',
      title: 'Send BTC',
      subtitle: '',
    },
  };
}

function txids(items: BlockchainActivityItem[]) {
  return items.map(item => item.view.txid);
}

describe('mergeSbtcDepositItems', () => {
  const feed = [
    createItem('pending-send', 300, 'pending'),
    createItem('newest', 300),
    createItem('middle', 200),
    createItem('oldest', 100),
  ];

  it('returns the feed untouched when there are no deposits', () => {
    expect(mergeSbtcDepositItems(feed, [])).toBe(feed);
  });

  it('puts pending deposits at the top so they are always visible', () => {
    const merged = mergeSbtcDepositItems(feed, [createItem('deposit', 150, 'pending')]);

    expect(txids(merged)[0]).toBe('deposit');
  });

  it('places a settled deposit by its timestamp', () => {
    const merged = mergeSbtcDepositItems(feed, [createItem('deposit', 250, 'failed')]);

    expect(txids(merged)).toEqual(['pending-send', 'newest', 'deposit', 'middle', 'oldest']);
  });

  it('appends a settled deposit older than every loaded item', () => {
    const merged = mergeSbtcDepositItems(feed, [createItem('deposit', 50, 'failed')]);

    expect(txids(merged).at(-1)).toBe('deposit');
  });

  it('keeps both pending and settled deposits', () => {
    const merged = mergeSbtcDepositItems(feed, [
      createItem('failed-deposit', 250, 'failed'),
      createItem('pending-deposit', 400, 'pending'),
    ]);

    expect(txids(merged)).toEqual([
      'pending-deposit',
      'pending-send',
      'newest',
      'failed-deposit',
      'middle',
      'oldest',
    ]);
  });

  it('does not mutate the feed it was given', () => {
    mergeSbtcDepositItems(feed, [createItem('deposit', 250, 'failed')]);

    expect(feed).toHaveLength(4);
  });
});
