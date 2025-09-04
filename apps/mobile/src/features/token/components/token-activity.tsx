import React from 'react';

import { FetchState, Loading } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityListItem } from '@/features/activity/activity-list-item';
import { t } from '@lingui/core/macro';

import { OnChainActivity } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

interface TokenActivityProps {
  activity: FetchState<OnChainActivity[]>;
  ListHeader: React.ReactNode;
}

export function TokenActivity({ activity, ListHeader }: TokenActivityProps) {
  const isLoading = activity.state === 'loading';
  const hasActivity = activity.state === 'success' && activity.value.length > 0;
  return (
    <Screen.List
      data={hasActivity ? activity.value : []}
      renderItem={({ item }) => <ActivityListItem activity={item} />}
      keyExtractor={(_, index) => `activity.${index}`}
      ListEmptyComponent={() => (isLoading ? <Loading mode="full" count={1} /> : undefined)}
      ListHeaderComponent={() => (
        <Box gap="1" backgroundColor="ink.background-secondary">
          {ListHeader}
          {(isLoading || hasActivity) && (
            <Box backgroundColor="ink.background-primary" px="5" pt="3">
              <Text variant="label03" py="2">{t`Activity`}</Text>
            </Box>
          )}
        </Box>
      )}
    />
  );
}
