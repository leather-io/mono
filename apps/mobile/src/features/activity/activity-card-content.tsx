import { Balance } from '@/components/balance/balance';

import { Activity } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

import { formatActivityStatus } from './utils/format-activity';

interface ActivityCardContentProps {
  activity: Activity;
}
export function ActivityCardContent({ activity }: ActivityCardContentProps) {
  return (
    <Box flexDirection="column" alignItems="flex-start" flexShrink={0} alignSelf="stretch">
      <Box alignItems="flex-start" gap="1" alignSelf="stretch" paddingTop="2">
        <Text variant="label02">
          {formatActivityStatus({
            activityType: activity.type,
            status: activity.status,
          })}
        </Text>
        {(activity.type === 'sendAsset' || activity.type === 'receiveAsset') && activity.value && (
          <Box alignItems="flex-start" gap="1" alignSelf="stretch">
            <Balance balance={activity.value.crypto} />
            <Balance variant="caption01" balance={activity.value.fiat} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
