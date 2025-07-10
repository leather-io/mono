import React from 'react';

import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { ActivityListItem } from '@/features/activity/activity-list-item';
import { RefreshControl, useRefreshHandler } from '@/features/refresh-control/refresh-control';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useTotalActivity } from '@/queries/activity/account-activity.query';

import { OnChainActivity } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

interface TokenActivityProps {
  ListHeader: React.ReactNode;
  ticker: string;
}

export function TokenActivity({ ListHeader, ticker }: TokenActivityProps) {
  const scrollViewAdjustmentOffset = 56;
  const { refreshing, onRefresh } = useRefreshHandler();
  const activity = useTotalActivity();
  // useActivityByAsset is on a per account basis so useTotalActivity for now and then filter in the component
  // const { data: activityByAsset } = useActivityByAsset(asset);

  return (
    <Screen>
      <Screen.Header
        blurOverlay={false}
        // topElement={isErrorTotalBalance && <FetchErrorCallout />}
        rightElement={
          <Box alignItems="center" flexDirection="row" justifyContent="center" mr="2">
            <NetworkBadge />
          </Box>
        }
      />
      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <Screen.List
            refreshControl={<RefreshControl progressViewOffset={scrollViewAdjustmentOffset} />}
            style={{ marginTop: -scrollViewAdjustmentOffset }}
            data={
              activity.value.filter(
                activity =>
                  'asset' in activity &&
                  'symbol' in activity.asset &&
                  activity.asset.symbol === ticker
              ) as OnChainActivity[]
            } // TODO: Unclear why was this cast. Needs clearing up.
            renderItem={({ item }) => <ActivityListItem activity={item} />}
            keyExtractor={(_, index) => `activity.${index}`}
            ListHeaderComponent={() => ListHeader}
            ListEmptyComponent={<ActivityEmpty />}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </FetchWrapper>
    </Screen>
  );
}
