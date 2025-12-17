import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Virtuoso } from 'react-virtuoso';

import { type ActivityView } from '@leather.io/features';

import { formatCurrency } from '@app/common/currency-formatter';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { useActivity } from '@app/query/activity/activity.query';
import { useStacksPendingTransactions } from '@app/query/stacks/mempool/mempool.hooks';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useUpdateSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.hooks';
import { useSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.selectors';

import { ActivityItem } from './components/activity-item';
import { ActivityListLayout } from './components/activity-list.layout';
import { createSubmittedActivityViews } from './submitted-activity-view';

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
  const { network } = useUserSettings();
  const activityQuery = useActivity(accountAddresses);
  const submittedTransactions = useSubmittedTransactions();
  const updateSubmittedTransactions = useUpdateSubmittedTransactions();

  const stacksAddress = accountAddresses.stacks?.stxAddress ?? '';
  const { transactions: stacksPendingTransactions } = useStacksPendingTransactions(stacksAddress);

  useEffect(() => {
    if (!stacksAddress) return;
    updateSubmittedTransactions(stacksPendingTransactions);
  }, [stacksAddress, stacksPendingTransactions, updateSubmittedTransactions]);

  const historicalActivity = activityQuery.data ?? [];
  const submittedActivity = createSubmittedActivityViews({ submittedTransactions, network });
  const activity = [...submittedActivity, ...historicalActivity];

  const hasActivity = activity.length > 0;
  const isLoading = activityQuery.isLoading;

  function itemContent(_: number, item: ActivityView) {
    return <ActivityItem item={item} formatCurrency={formatCurrency} />;
  }

  function computeItemKey(_: number, item: ActivityView) {
    return item.key;
  }

  if (activityQuery.isError) {
    return (
      <ActivityListLayout isLoading={false} hasActivity>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          Unable to load activity. Please try again later.
        </div>
        <Outlet />
      </ActivityListLayout>
    );
  }

  return (
    <ActivityListLayout isLoading={isLoading} hasActivity={hasActivity}>
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
