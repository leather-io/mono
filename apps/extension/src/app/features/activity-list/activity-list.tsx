import { useCallback } from 'react';
import { Outlet } from 'react-router';

import { type ActivityLinkClickHandler, makeActivityLink } from '@leather.io/features';
import { type OnChainActivity } from '@leather.io/models';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useAccountActivity } from '@app/query/activity/account-activity.query';
import { useAccountAddresses } from '@app/services/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

import { ActivityList as ActivityFeedList } from './components/activity-list';

export function ActivityList() {
  const accountIndex = useCurrentAccountIndex();
  const accountAddresses = useAccountAddresses(accountIndex);
  const activityQuery = useAccountActivity(accountAddresses);
  const network = useCurrentNetworkState();

  const getActivityLink = useCallback(
    (activity: OnChainActivity) => {
      if (!('asset' in activity)) return null;
      return makeActivityLink({
        txid: activity.txid,
        networkPreference: network,
        asset: activity.asset,
      });
    },
    [network]
  );

  const handleActivityLinkClick = useCallback<ActivityLinkClickHandler>((activityLink: string) => {
    openInNewTab(activityLink);
  }, []);

  return (
    <>
      <ActivityFeedList
        activity={activityQuery.data ?? []}
        isLoading={activityQuery.isLoading}
        getActivityLink={getActivityLink}
        onActivityLinkClick={handleActivityLinkClick}
        minWidth="100%"
        useWindowScroll
      />
      <Outlet />
    </>
  );
}
