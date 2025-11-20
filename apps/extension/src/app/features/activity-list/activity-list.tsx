import { useCallback } from 'react';
import { Outlet } from 'react-router';
import { Virtuoso } from 'react-virtuoso';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { type ActivityView } from '@leather.io/features';
import { LoadingSpinner } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { useActivity } from '@app/query/activity/activity.query';
import { useAccountAddresses } from '@app/services/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { ActivityItem } from './components/activity-item';

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

  if (isLoading) {
    return (
      <>
        <Stack flexGrow={1} position="relative">
          <Flex
            p="space.06"
            textAlign="center"
            fontSize="24px"
            justifyContent="center"
            flexGrow={1}
          >
            <LoadingSpinner />
          </Flex>
        </Stack>
        <Outlet />
      </>
    );
  }

  if (activity.length === 0) {
    return (
      <>
        <Flex
          p="space.06"
          textAlign="center"
          justifyContent="center"
          flexGrow={1}
          textStyle="body.02"
          color="ink.text-subdued"
        >
          No recent activity
        </Flex>
        <Outlet />
      </>
    );
  }

  return (
    <>
      <Stack minWidth="100%" flexGrow={1} minHeight={0} height="100%" position="relative">
        <Virtuoso
          style={{ height: '100%' }}
          data={activity}
          itemContent={itemContent}
          computeItemKey={computeItemKey}
          overscan={200}
          useWindowScroll
        />
        <styled.div
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="48px"
          bgGradient="to-t"
          gradientFrom="ink.background-primary"
          gradientTo="transparent"
        />
      </Stack>
      <Outlet />
    </>
  );
}
