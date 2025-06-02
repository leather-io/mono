import { useMemo, useState } from 'react';

import { useRefreshHandler } from '@/components/page/page.layout';
import { useBrowser } from '@/core/browser-provider';
import { ViewMode } from '@/shared/types';
import { useSettings } from '@/store/settings/settings';
import { FlashList } from '@shopify/flash-list';

import { Activity, OnChainActivity, OnChainActivityTypes } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { ActivityCard } from './activity-card';
import { ActivityEmpty } from './activity-empty';
import { ActivityListItem, ActivityListItemProps } from './activity-list-item';
import { serializeActivityList } from './utils/serialize-activity-list';

interface ActivityListProps {
  activity: Activity[];
  mode?: ViewMode;
}

export function ActivityList({ activity, mode = 'full' }: ActivityListProps) {
  const { networkPreference } = useSettings();
  const { linkingRef } = useBrowser();
  const { refreshing, onRefresh } = useRefreshHandler();
  const [renderLimit, setRenderLimit] = useState(10);
  const filteredActivities = activity
    .slice(0, renderLimit)
    .filter(activity => activity.type in OnChainActivityTypes) as OnChainActivity[];

  if (mode === 'widget') {
    return (
      <Box flexDirection="row" gap="3">
        {filteredActivities.map((activity, index) => (
          <ActivityCard key={`activity.${index}`} activity={activity} />
        ))}
      </Box>
    );
  }

  const activityItemHeight = 72;
  const serializedActivities = useMemo(
    () =>
      filteredActivities.map(activity =>
        serializeActivityList(activity, networkPreference, linkingRef)
      ),
    [filteredActivities, networkPreference]
  );
  return (
    <Box flex={1} width="100%" height="100%">
      <FlashList
        data={serializedActivities}
        renderItem={({ item }: { item: ActivityListItemProps }) => (
          <ActivityListItem
            txid={item.txid}
            avatar={item.avatar}
            title={item.title}
            caption={item.caption}
            fiatBalance={item.fiatBalance}
            cryptoBalance={item.cryptoBalance}
            onPress={item.onPress}
          />
        )}
        estimatedItemSize={activityItemHeight}
        keyExtractor={(_, index) => `activity.${index}`}
        showsVerticalScrollIndicator={false}
        onEndReached={() => setRenderLimit(renderLimit + 10)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<ActivityEmpty />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </Box>
  );
}
