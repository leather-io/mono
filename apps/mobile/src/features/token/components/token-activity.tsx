import React from 'react';

import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { ActivityListItem } from '@/features/activity/activity-list-item';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import { OnChainActivity } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';
import { isDefined } from '@leather.io/utils';

interface TokenActivityProps {
  ListHeader: React.ReactNode;
  ticker: string;
  accountIndex?: number;
  fingerprint?: string;
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

export function TokenActivity({
  ListHeader,
  ticker,
  accountIndex,
  fingerprint,
}: TokenActivityProps) {
  const scrollViewAdjustmentOffset = 56;
  const activity = useTotalActivity();

  return (
    <Screen>
      <Screen.Header
        blurOverlay={false}
        leftElement={null}
        rightElement={
          <Box alignItems="center" flexDirection="row" justifyContent="center" mr="2">
            <NetworkBadge />
          </Box>
        }
      />
      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <BottomSheetFlatList
            style={{ marginTop: -scrollViewAdjustmentOffset }}
            data={activity.value
              .filter(activity => activity && 'asset' in activity)
              .filter(activity => filterByTicker(activity, ticker))
              .filter(activity => {
                if (isDefined(accountIndex) && isDefined(fingerprint)) {
                  return filterByAccount(activity, accountIndex, fingerprint);
                }
                return true;
              })}
            renderItem={({ item }) => <ActivityListItem activity={item} />}
            keyExtractor={(_, index) => `activity.${index}`}
            ListHeaderComponent={() => ListHeader}
            ListEmptyComponent={<ActivityEmpty />}
          />
        )}
      </FetchWrapper>
    </Screen>
  );
}
