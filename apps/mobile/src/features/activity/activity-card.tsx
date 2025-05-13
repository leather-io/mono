import { Card } from '@/components/card';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';

import { OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Box } from '@leather.io/ui/native';

import { ActivityCardContent } from './activity-card-content';
import { goToStacksExplorer } from './utils/go-to-stacks-explorer';

interface ActivityCardProps {
  activity: OnChainActivity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { mode } = useCurrentNetworkState();

  const { txid, status, type } = activity;
  const asset = 'asset' in activity ? activity.asset : undefined;
  const activityAsset = asset && 'symbol' in asset ? asset : undefined;
  return (
    <Card onPress={txid ? () => goToStacksExplorer(txid, mode) : undefined} width={200}>
      <Box flexDirection="row" justifyContent="space-between">
        <ActivityAvatarIcon type={type} asset={activityAsset} status={status} />
      </Box>
      <ActivityCardContent activity={activity} />
    </Card>
  );
}
