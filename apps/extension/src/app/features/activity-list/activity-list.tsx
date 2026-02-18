import { useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { type ActivityView } from '@leather.io/features';

import { formatCurrency } from '@app/common/currency-formatter';
import { useActivity } from '@app/query/activity/activity.query';
import { Outlet } from '@app/routes/compat';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { ActivityItem } from './components/activity-item';
import { ActivityListLayout } from './components/activity-list.layout';

/*
 * Infinite scroll support is built into this component via the onLoadMore prop,
 * but it's currently not being used because the activity service API doesn't
 * support pagination. All activity is fetched at once. To enable infinite scroll:
 * 1. Update the activity service to support pagination parameters (offset/limit or cursor)
 * 2. Update the activity query config to use useInfiniteQuery instead of useQuery
 * 3. Pass the onLoadMore handler from the parent component
 */

export function ActivityList() {
  const accountIndex = useCurrentAccountIndex();
  const accountAddresses = useAccountAddresses(accountIndex);
  const activityQuery = useActivity(accountAddresses);

  const activity = activityQuery.data ?? [];
  const isLoading = activityQuery.isLoading;

  const itemContent = useCallback(
    (_: number, item: ActivityView) => <ActivityItem item={item} formatCurrency={formatCurrency} />,
    []
  );

  const computeItemKey = useCallback((_: number, item: ActivityView) => item.key, []);

  return (
    <ActivityListLayout isLoading={isLoading} hasActivity={activity.length > 0}>
      <Virtuoso
        style={{ height: '100%' }}
        data={activity}
        itemContent={itemContent}
        computeItemKey={computeItemKey}
        overscan={200}
        useWindowScroll
      />
      <Outlet />
    </ActivityListLayout>
  );
}
