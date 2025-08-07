import React, { useMemo } from 'react';

import { configureTokenParamsSchema } from '@/app/(tabs)/(index)/account/[accountId]/token/[tokenId]/index';
import { Screen } from '@/components/screen/screen';
import { ActivityListItem } from '@/features/activity/activity-list-item';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';
import { useLocalSearchParams } from 'expo-router';

import { OnChainActivity } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';
import { isDefined } from '@leather.io/utils';

import { TokenDetailsCard } from './token-details-card';

interface TokenActivityProps {
  ListHeader: React.ReactNode;
}

function filterByTicker(activity: OnChainActivity, ticker: string) {
  return 'asset' in activity && 'symbol' in activity.asset && activity.asset.symbol === ticker;
}
function filterByAccount(activity: OnChainActivity, accountIndex: number, fingerprint: string) {
  return (
    'account' in activity &&
    activity.account.accountIndex === accountIndex &&
    activity.account.fingerprint === fingerprint
  );
}

export function TokenActivity({ ListHeader }: TokenActivityProps) {
  // PETE - consider using useAccountActivityQuery or a token specific query
  const activity = useTotalActivity();
  const params = useLocalSearchParams();
  const { tokenId, accountId } = configureTokenParamsSchema.parse(params);

  const activityData: OnChainActivity[] | undefined = useMemo(() => {
    if (activity.state === 'success') {
      return activity.value
        .filter(activity => activity && 'asset' in activity)
        .filter(activity => filterByTicker(activity, tokenId))
        .filter(activity => {
          if (isDefined(accountId)) {
            const { accountIndex, fingerprint } = deserializeAccountId(accountId);
            return filterByAccount(activity, accountIndex, fingerprint);
          }
          return true;
        });
    }
    return undefined;
  }, [activity, tokenId, accountId]);

  return (
    <Screen.List
      data={activityData}
      renderItem={({ item }) => <ActivityListItem activity={item} />}
      keyExtractor={(_, index) => `activity.${index}`}
      ListHeaderComponent={() => (
        <Box gap="1" backgroundColor="ink.background-secondary">
          {ListHeader}
          {activityData && activityData.length > 0 && <TokenDetailsCard title={t`Activity`} />}
        </Box>
      )}
    />
  );
}
