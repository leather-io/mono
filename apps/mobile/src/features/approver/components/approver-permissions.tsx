import { t } from '@lingui/core/macro';

import { Box, CheckmarkIcon, Text } from '@leather.io/ui/native';

type Permissions = 'view_balance_activity' | 'request_approval';

interface ApproverPermissionsProps {
  permissions: Permissions[];
}

export function ApproverPermissions({ permissions }: ApproverPermissionsProps) {
  const permissionMap = {
    view_balance_activity: t`View your wallet balance & activity`,
    request_approval: t`Request approval for transactions`,
  };

  return (
    <Box gap="4" py="3">
      <Text variant="label03">{t`This app would like to`}</Text>
      <Box gap="3">
        {permissions.map(permission => {
          return (
            <Box flexDirection="row" alignItems="center" gap="3" key={permission}>
              <CheckmarkIcon variant="small" />
              <Text variant="caption01">{permissionMap[permission]}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
