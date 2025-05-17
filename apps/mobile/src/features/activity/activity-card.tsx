import { Card } from '@/components/card';
import { useSettings } from '@/store/settings/settings';

import { OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Box } from '@leather.io/ui/native';

import { ActivityCardContent } from './activity-card-content';
import { goToActivityExplorer, onPressActivity } from './utils/go-to-activity-explorer';

interface ActivityCardProps {
  activity: OnChainActivity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { networkPreference } = useSettings();

  const { txid, status, type } = activity;
  const activityHasAsset = 'asset' in activity;
  const asset = activityHasAsset && 'symbol' in activity.asset ? activity.asset : undefined;
  return (
    <Card
      onPress={
        txid && asset ? () => onPressActivity({ asset, txid, networkPreference }) : undefined
      }
      width={200}
    >
      <Box flexDirection="row" justifyContent="space-between">
        <ActivityAvatarIcon type={type} asset={asset} status={status} />
      </Box>
      <ActivityCardContent activity={activity} />
    </Card>
  );
}
