import { useMemo, useState } from 'react';

import { Balance } from '@/components/balance/balance';
import { useBrowser } from '@/core/browser-provider';
import { useRefreshHandler } from '@/hooks/use-refresh-handler';
import { ViewMode } from '@/shared/types';
import { useSettings } from '@/store/settings/settings';
import { FlashList } from '@shopify/flash-list';
import { ResponsiveValue } from '@shopify/restyle';

import { Activity, OnChainActivity, OnChainActivityTypes } from '@leather.io/models';
import { ActivityAvatarIcon, Text, Theme } from '@leather.io/ui/native';
import { Box } from '@leather.io/ui/native';

import { ActivityCard } from './activity-card';
import { ActivityEmpty } from './activity-empty';
import { ActivityListItem, ActivityListItemProps } from './activity-list-item';
import { formatActivityItem } from './utils/format-activity';

interface ActivityListProps {
  activity: Activity[];
  mode?: ViewMode;
}

export function ActivityList({ activity, mode = 'full' }: ActivityListProps) {
  const { networkPreference } = useSettings();
  const { linkingRef } = useBrowser();
  const { refreshing, onRefresh } = useRefreshHandler();
  const initialRenderLimit = 10;
  const [renderLimit, setRenderLimit] = useState(initialRenderLimit);

  const activityItems = useMemo(
    () =>
      activity
        .filter(activity => activity.type in OnChainActivityTypes)
        .map(activityItem =>
          formatActivityItem(activityItem as OnChainActivity, networkPreference, linkingRef)
        ),
    [activity, networkPreference]
  );

  const filteredActivities = activityItems.slice(0, renderLimit);

  if (mode === 'widget') {
    return (
      <Box flexDirection="row" gap="3">
        {filteredActivities.map((activity, index) => (
          <ActivityCard key={`activity.${index}`} {...activity} />
        ))}
      </Box>
    );
  }

  const itemHeight = 72;

  return (
    <Box flex={1} width="100%" height="100%">
      <FlashList
        data={filteredActivities}
        renderItem={({ item }) => (
          <ActivityListItem
            txid={item.txid}
            avatar={
              <ActivityAvatarIcon
                type={item.avatar?.type}
                asset={item.avatar?.asset}
                status={item.avatar?.status}
              />
            }
            title={item.title}
            caption={item.caption}
            quoteBalance={
              <Balance
                operator={item.quoteBalance?.operator}
                balance={item.quoteBalance?.balance}
                color={
                  item.quoteBalance?.color as ResponsiveValue<
                    keyof Theme['colors'],
                    Theme['breakpoints']
                  >
                }
              />
            }
            cryptoBalance={
              <Balance
                balance={item.cryptoBalance?.balance}
                variant="caption01"
                color="ink.text-subdued"
                lineHeight={16}
                fontSize={13}
              />
            }
            onPress={item.onPress}
          />
        )}
        estimatedItemSize={itemHeight}
        keyExtractor={(_, index) => `activity.${index}`}
        showsVerticalScrollIndicator={false}
        onEndReached={() => setRenderLimit(renderLimit + 20)}
        onEndReachedThreshold={0.01}
        ListEmptyComponent={<ActivityEmpty />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </Box>
  );
}
