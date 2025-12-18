import { useCallback } from 'react';

import { FetchState } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityItem } from '@/features/activity/activity-item';
import { ActivityLoading } from '@/features/activity/activity-loading';
import { t } from '@lingui/core/macro';

import { type ActivityView } from '@leather.io/features';
import { Box, Text } from '@leather.io/ui/native';

interface TokenActivityProps {
  activity: FetchState<ActivityView[]>;
  ListHeader: React.ReactNode;
}

export function TokenActivity({ activity, ListHeader }: TokenActivityProps) {
  const renderItem = useCallback(
    ({ item }: { item: ActivityView }) => <ActivityItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: ActivityView) => item.key, []);

  if (activity.state === 'loading') {
    return <ActivityLoading />;
  }

  const hasActivity = activity.state === 'success' && activity.value.length > 0;

  const listData = activity.state === 'success' ? activity.value : [];

  return (
    <Screen.List
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={() => (
        <Box gap="1" backgroundColor="ink.background-secondary">
          {ListHeader}
          {hasActivity && (
            <Box backgroundColor="ink.background-primary" px="5" pt="3">
              <Text variant="label03" py="2">{t`Activity`}</Text>
            </Box>
          )}
        </Box>
      )}
    />
  );
}
