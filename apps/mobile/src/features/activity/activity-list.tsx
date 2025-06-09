import { useCallback, useMemo, useState } from 'react';
import { FlatList } from 'react-native';

import { useRefreshHandler } from '@/components/page/page.layout';
import { useBrowser } from '@/core/browser-provider';
import { ViewMode } from '@/shared/types';
import { useSettings } from '@/store/settings/settings';
import { FlashList } from '@shopify/flash-list';

import { Activity, OnChainActivity, OnChainActivityTypes } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

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
  const [renderLimit, setRenderLimit] = useState(200);
  const filteredActivities = activity
    .slice(0, mode === 'widget' ? 10 : renderLimit)
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

  const renderItem = useCallback(
    ({ item }: { item: ActivityListItemProps }) => (
      <ActivityListItem
        txid={item.txid}
        avatar={item.avatar}
        title={item.title}
        caption={item.caption}
        quoteBalance={item.quoteBalance}
        cryptoBalance={item.cryptoBalance}
        onPress={item.onPress}
      />
    ),
    []
  );

  // const renderTextItem = useCallback(
  //   ({ item }: { item: ActivityListItemProps }) => <Text>ITEM</Text>,
  //   []
  // );
  return (
    <Box flex={1} width="100%" height="100%">
      <FlatList
        data={serializedActivities}
        renderItem={renderItem}
        keyExtractor={(_, index) => `activity.${index}`}
      />
      {/* <FlashList
        data={serializedActivities}
        renderItem={renderTextItem}
        estimatedItemSize={activityItemHeight}
        keyExtractor={(item, index) => {
          const uniqueKey = `${item.txid}-${index}`;
          console.log('uniqueKey', uniqueKey);
          return uniqueKey;
        }}
        // showsVerticalScrollIndicator={false}
        onEndReached={useCallback(() => {
          const timeoutId = setTimeout(() => {
            setRenderLimit(renderLimit => renderLimit + 10);
          }, 500);
          return () => clearTimeout(timeoutId);
        }, [])}
        // onEndReachedThreshold={0.5}
        // ListEmptyComponent={<ActivityEmpty />}
        // refreshing={refreshing}
        // onRefresh={onRefresh}
      /> */}
      {/* <FlashList
        data={serializedActivities}
        renderItem={renderItem}
        estimatedItemSize={activityItemHeight}
        keyExtractor={(_, index) => `activity.${index}`}
        // keyExtractor={() => uuid()}
        showsVerticalScrollIndicator={false}
        onEndReached={() => setRenderLimit(renderLimit + 10)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<ActivityEmpty />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        overrideItemLayout={layout => {
          layout.size = 72;
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        removeClippedSubviews={true}
      /> */}
    </Box>
  );
}
