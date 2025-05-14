import React, { useState } from 'react';
// NOTE: '/src' is necessary to fix an import issue with FlashList
// https://github.com/Shopify/flash-list/issues/942
// @ts-ignore
// import { FlashList } from '@shopify/flash-list/src/index';
import { FlatList } from 'react-native';

import { useRefreshHandler } from '@/components/page/page.layout';
import { ViewMode } from '@/shared/types';

import { Activity, OnChainActivity, OnChainActivityTypes } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';
import { isDefined } from '@leather.io/utils';

import { ActivityCard } from './activity-card';
import { ActivityEmpty } from './activity-empty';
import { ActivityListItem } from './activity-list-item';

interface ActivityListProps {
  activity: Activity[];
  mode?: ViewMode;
}

// type FlashListProps = {
//   data: OnChainActivity[];
//   renderItem: ({ item }: { item: OnChainActivity }) => React.ReactElement;
//   estimatedItemSize: number;
//   keyExtractor: (item: OnChainActivity, index: number) => string;
//   showsVerticalScrollIndicator?: boolean;
//   onEndReached?: () => void;
//   onEndReachedThreshold?: number;
//   ListEmptyComponent?: React.ComponentType | React.ReactElement;
// };

export function ActivityList({ activity, mode = 'full' }: ActivityListProps) {
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

  return (
    <Box flex={1} height="100%">
      {/* <FlashList
        data={filteredActivities}
        renderItem={({ item }: { item: OnChainActivity }) => {
          // if (isDefined(item)) {
          //   return (
          //     // @ts-ignore
          //     <ActivityListItem activity={item} />
          //   );
          // }
          return <ActivityListItem activity={item} />;
        }}
        estimatedItemSize={80}
        // keyExtractor={(_, index) => `activity.${index}`}
        // showsVerticalScrollIndicator={false}
        // onEndReached={() => setRenderLimit(renderLimit + 10)}
        // onEndReachedThreshold={0.5}
        // ListEmptyComponent={<ActivityEmpty />}
      /> */}
      <FlatList
        data={filteredActivities}
        renderItem={({ item }: { item: OnChainActivity }) => <ActivityListItem activity={item} />}
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
