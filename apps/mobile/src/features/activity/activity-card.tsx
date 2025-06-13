import { Card } from '@/components/card';
import { useBrowser } from '@/core/browser-provider';
import { useSettings } from '@/store/settings/settings';

import { OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Box } from '@leather.io/ui/native';

import { ActivityCardContent } from './activity-card-content';
import { makeActivityLink } from './utils/make-activity-link';

interface ActivityCardProps {
  // activity: OnChainActivity;
  txid: string;
  type: OnChainActivity['type'];
  avatar: React.ReactNode;
  title: React.ReactNode;
  caption: React.ReactNode;
  quoteBalance?: React.ReactNode;
  cryptoBalance?: React.ReactNode;
  onPress: () => void;
}

export function ActivityCard({
  txid,
  type,
  avatar,
  title,
  caption,
  quoteBalance,
  cryptoBalance,
  onPress,
}: ActivityCardProps) {
  // const { networkPreference } = useSettings();
  // const { linkingRef } = useBrowser();

  // const { txid, status, type } = activity;
  // const activityHasAsset = 'asset' in activity;
  // const asset = activityHasAsset && 'symbol' in activity.asset ? activity.asset : undefined;
  return (
    <Card onPress={onPress} width={200}>
      <Box flexDirection="row" justifyContent="space-between">
        <ActivityAvatarIcon type={type} asset={asset} status={status} />
      </Box>
      <ActivityCardContent activity={activity} />
    </Card>
  );
}
