import { formatActivityType } from '@/app/activity/utils/format-activity';
import { Balance } from '@/components/balance/balance';

import { Activity } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

interface ActivityCardContentProps {
  activity: Activity;
}
export function ActivityCardContent({ activity }: ActivityCardContentProps) {
  return (
    <Box flexDirection="column" alignItems="flex-start" flexShrink={0} alignSelf="stretch">
      <Box alignItems="flex-start" gap="1" alignSelf="stretch" paddingTop="2">
        <Text variant="label02">{formatActivityType(activity.type)}</Text>
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
