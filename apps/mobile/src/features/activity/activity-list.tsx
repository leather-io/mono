import { useMemo, useState } from 'react';

import { Balance } from '@/components/balance/balance';
import { useBrowser } from '@/core/browser-provider';
import { useRefreshHandler } from '@/hooks/use-refresh-handler';
import { ViewMode } from '@/shared/types';
import { useSettings } from '@/store/settings/settings';
import { FlashList } from '@shopify/flash-list';
import { ResponsiveValue } from '@shopify/restyle';

import {
  Activity,
  FungibleCryptoAsset,
  OnChainActivity,
  OnChainActivityTypes,
} from '@leather.io/models';
import { ActivityAvatarIcon, Box, Theme } from '@leather.io/ui/native';

import { ActivityCard } from './activity-card';
import { ActivityEmpty } from './activity-empty';
import { ActivityListItem } from './activity-list-item';
import { formatActivityItem } from './utils/format-activity';
import { makeActivityLink } from './utils/make-activity-link';

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
    [activity, networkPreference, linkingRef]
  );

  const filteredActivities = activityItems.slice(0, renderLimit);

  if (mode === 'widget') {
    return (
      <Box flexDirection="row" gap="3">
        {filteredActivities.map((activity, index) => (
          <ActivityCard
            key={`activity.${index}`}
            type={activity.type}
            asset={activity.avatar?.asset as FungibleCryptoAsset}
            status={activity.avatar?.status}
            onPress={() => {
              const activityLink = makeActivityLink({
                asset: activity.avatar?.asset,
                txid: activity.txid,
                networkPreference,
              });
              if (activityLink) {
                linkingRef.current?.openURL(activityLink);
              }
            }}
            quoteBalance={activity?.quoteBalance?.balance}
            cryptoBalance={activity?.cryptoBalance?.balance}
          />
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
              item.quoteBalance?.balance ? (
                <Balance
                  operator={item.quoteBalance?.operator}
                  balance={item.quoteBalance?.balance}
                  color={
                    item.quoteBalance?.color as ResponsiveValue<
                      keyof Theme['colors'],
                      Theme['breakpoints']
                    >
                  }
                  isQuoteCurrency
                />
              ) : undefined
            }
            cryptoBalance={
              item.cryptoBalance?.balance ? (
                <Balance
                  balance={item.cryptoBalance?.balance}
                  variant="caption01"
                  color="ink.text-subdued"
                  lineHeight={16}
                  fontSize={13}
                />
              ) : undefined
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
