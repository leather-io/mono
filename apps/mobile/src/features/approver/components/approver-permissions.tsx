import { t } from '@lingui/macro';

import { Box, Cell, CheckmarkIcon, Text } from '@leather.io/ui/native';

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
    <Box>
      <Text variant="label01">
        {t({
          id: 'approver.permissions.title',
          message: 'This app would like to',
        })}
      </Text>
      <Box mx="-5">
        {permissions.map(permission => (
          <Cell.Root key={permission} pressable={false}>
            <Cell.Icon>
              <CheckmarkIcon variant="small" />
            </Cell.Icon>
            <Cell.Content style={{ flexGrow: 1, flexShrink: 0 }}>
              <Cell.Label variant="primary">{permissionMap[permission]}</Cell.Label>
            </Cell.Content>
          </Cell.Root>
        ))}
      </Box>
    </Box>
  );
}
