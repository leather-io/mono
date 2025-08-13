import React from 'react';

import { Screen } from '@/components/screen/screen';
import { ActivityListItem } from '@/features/activity/activity-list-item';
import { t } from '@lingui/core/macro';

import { OnChainActivity } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { TokenDetailsCard } from './token-details-card';

interface TokenActivityProps {
  activity: OnChainActivity[];
  ListHeader: React.ReactNode;
}

export function TokenActivity({ activity, ListHeader }: TokenActivityProps) {
  return (
    <Screen.List
      data={activity}
      renderItem={({ item }) => <ActivityListItem activity={item} />}
      keyExtractor={(_, index) => `activity.${index}`}
      ListHeaderComponent={() => (
        <Box gap="1" backgroundColor="ink.background-secondary">
          {ListHeader}
          {activity && activity.length > 0 && <TokenDetailsCard title={t`Activity`} />}
        </Box>
      )}
    />
  );
}
