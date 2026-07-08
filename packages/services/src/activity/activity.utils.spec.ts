import { stxAsset } from '@leather.io/constants';
import { Activity, BlockchainActivity } from '@leather.io/models';

import { activityTouchesAsset, sortActivityByTimestampDesc } from './activity.utils';

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

describe(activityTouchesAsset.name, () => {
  const stxChange = { direction: 'received', asset: stxAsset } as unknown;
  const activityWithStx = {
    balanceChanges: [stxChange],
  } as unknown as BlockchainActivity;
  const activityWithout = { balanceChanges: [] } as unknown as BlockchainActivity;

  it('matches when any balance change carries the asset', () => {
    expect(activityTouchesAsset(activityWithStx, { protocol: 'nativeStx', id: 'STX' })).toBe(true);
  });

  it('does not match a different asset or an empty change set', () => {
    expect(activityTouchesAsset(activityWithStx, { protocol: 'sip10', id: 'SP.token::tok' })).toBe(
      false
    );
    expect(activityTouchesAsset(activityWithout, { protocol: 'nativeStx', id: 'STX' })).toBe(false);
  });
});
