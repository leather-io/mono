import { Balance } from '@/components/balance/balance';

import { OnChainActivity } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

import { formatActivityStatus } from './utils/format-activity';

interface ActivityCardContentProps {
  activity: OnChainActivity;
}
export function ActivityCardContent({ activity }: ActivityCardContentProps) {
  return (
    <Box flexDirection="column" alignItems="flex-start" flexShrink={0} alignSelf="stretch">
      <Box alignItems="flex-start" gap="1" alignSelf="stretch">
        <Text variant="label02">
          {formatActivityStatus({
            type: activity.type,
            status: activity.status,
          })}
        </Text>
        {(activity.type === 'sendAsset' || activity.type === 'receiveAsset') && activity.value && (
          <Box alignItems="flex-start" gap="1" alignSelf="stretch">
            <Balance balance={activity.value.crypto} variant="label02" />
            <Balance
              balance={activity.value.fiat}
              variant="caption01"
              color="ink.text-subdued"
              fontWeight="400"
              lineHeight={16}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
