import { t } from '@lingui/macro';

import { Box, CheckmarkIcon, Flag, Text } from '@leather.io/ui/native';

type Permissions = 'view_balance_activity' | 'request_approval';

interface ApproverPermissionsProps {
  permissions: Permissions[];
}

export function ApproverPermissions({ permissions }: ApproverPermissionsProps) {
  const permissionMap = {
    view_balance_activity: t({
      id: 'approver.permissions.view_balance_activity',
      message: 'View your wallet balance & activity',
    }),
    request_approval: t({
      id: 'approver.permissions.request_approval',
      message: 'Request approval for transactions',
    }),
  };

  return (
    <Box gap="4" py="3">
      <Text variant="label03">
        {t({
          id: 'approver.permissions.title',
          message: 'This app would like to',
        })}
      </Text>
      <Box gap="3">
        {permissions.map(permission => {
          return (
            <Flag img={<CheckmarkIcon variant="small" />} key={permission}>
              <Text variant="caption01">{permissionMap[permission]}</Text>
            </Flag>
          );
        })}
      </Box>
    </Box>
  );
}
