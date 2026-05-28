import { stxAsset } from '@leather.io/constants';
import { Activity, BlockchainActivity, Sip10Asset } from '@leather.io/models';
import { createMoney, initBigNumber } from '@leather.io/utils';

import { filterActivityByAsset, sortActivityByTimestampDesc } from './activity.utils';

describe(sortActivityByTimestampDesc.name, () => {
  it('sorts activity by timestamp in descending order', () => {
    const activity1 = { timestamp: 1741170001 } as Activity;
    const activity2 = { timestamp: 1741170002 } as Activity;
    const activity3 = { timestamp: 1741170003 } as Activity;
    const activity4 = { timestamp: 1741170004 } as Activity;

    const activityList = [activity2, activity4, activity1, activity3];
    const activitySorted = activityList.sort(sortActivityByTimestampDesc);

    expect(activitySorted[0]).toEqual(activity4);
    expect(activitySorted[1]).toEqual(activity3);
    expect(activitySorted[2]).toEqual(activity2);
    expect(activitySorted[3]).toEqual(activity1);
  });
});

describe(filterActivityByAsset.name, () => {
  const btcActivity: BlockchainActivity = {
    timestamp: 1,
    txid: 'btc-tx',
    status: 'success',
    chain: 'bitcoin',
    initiatedByUser: true,
    events: [
      {
        action: 'sent',
        asset: { protocol: 'nativeBtc', chain: 'bitcoin', symbol: 'BTC' } as any,
        amount: { crypto: createMoney(initBigNumber('1000'), 'BTC'), quote: createMoney(0, 'USD') },
      },
    ],
  };

  const stxActivity: BlockchainActivity = {
    timestamp: 2,
    txid: 'stx-tx',
    status: 'success',
    chain: 'stacks',
    initiatedByUser: true,
    events: [
      {
        action: 'sent',
        asset: stxAsset,
        amount: { crypto: createMoney(initBigNumber('5000'), 'STX'), quote: createMoney(0, 'USD') },
      },
    ],
  };

  const sip10Asset: Sip10Asset = {
    chain: 'stacks',
    category: 'fungible',
    protocol: 'sip10',
    assetId: 'SP123.token::tkn',
    contractId: 'SP123.token',
    symbol: 'TKN',
    decimals: 6,
    name: 'Token',
    canTransfer: true,
    hasMemo: false,
    imageCanonicalUri: '',
  };

  const sip10Activity: BlockchainActivity = {
    timestamp: 3,
    txid: 'sip10-tx',
    status: 'success',
    chain: 'stacks',
    initiatedByUser: true,
    events: [
      {
        action: 'received',
        asset: sip10Asset,
        amount: {
          crypto: createMoney(initBigNumber('100'), 'TKN', 6),
          quote: createMoney(0, 'USD'),
        },
      },
    ],
  };

  const all = [btcActivity, stxActivity, sip10Activity];

  it('filters by nativeBtc', () => {
    const result = filterActivityByAsset(all, { protocol: 'nativeBtc' } as any);
    expect(result).toEqual([btcActivity]);
  });

  it('filters by nativeStx', () => {
    const result = filterActivityByAsset(all, stxAsset);
    expect(result).toEqual([stxActivity]);
  });

  it('filters by sip10 asset id', () => {
    const result = filterActivityByAsset(all, sip10Asset);
    expect(result).toEqual([sip10Activity]);
  });

  it('returns empty array for unsupported protocol', () => {
    const result = filterActivityByAsset(all, { protocol: 'unknown' } as any);
    expect(result).toEqual([]);
  });
});
