import { useCurrentNetworkState } from '@/queries/leather-query-provider';

import { Activity } from '@leather.io/models';
import { Box, Pressable, usePressedState } from '@leather.io/ui/native';

import { goToStacksExplorer } from '../utils/go-to-stacks-explorer';
import { ActivityCardContent } from './activity-card-content';
import { ActivityIcon } from './activity-icon';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { onPressIn, onPressOut } = usePressedState();
  const { mode } = useCurrentNetworkState();

  const txid = 'txid' in activity ? activity.txid : undefined;
  const asset = 'asset' in activity ? activity.asset : undefined;
  const activityAsset = asset && 'symbol' in asset ? asset : undefined;
  const status = 'status' in activity ? activity.status : undefined;
  return (
    <Pressable
      width={200}
      height={156}
      p="4"
      justifyContent="space-between"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-default"
      borderRadius="md"
      shadowOpacity={0.04}
      shadowOffset={{ width: 0, height: 2 }}
      shadowRadius={6}
      onPress={txid ? () => goToStacksExplorer(txid, mode) : undefined}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      pressEffects={{
        opacity: { from: 1, to: 0.95 },
      }}
    >
      <Box flexDirection="row" justifyContent="space-between">
        <ActivityIcon type={activity.type} asset={activityAsset} status={status} />
      </Box>
      <ActivityCardContent activity={activity} />
    </Pressable>
  );
}
