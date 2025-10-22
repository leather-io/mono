import { t } from '@lingui/core/macro';

import { Box, Text } from '@leather.io/ui/native';

import { StatusBar } from './status-bar';
import { Status } from './utils';

export function StatusRowBase({ status, date }: { status: Status; date: string | null }) {
  const bg = (
    {
      pending: 'yellow.background-primary',
      success: 'green.background-primary',
      failed: 'red.background-primary',
      stalled: 'yellow.background-primary',
    } as const
  )[status];
  const actionTextColor = (
    {
      pending: 'yellow.action-primary-default',
      success: 'green.action-primary-default',
      failed: 'red.action-primary-default',
      stalled: 'yellow.action-primary-default',
    } as const
  )[status];
  const actionText = (
    {
      pending: t`Pending`,
      success: t`Success`,
      failed: t`Failed`,
      stalled: t`Pending`,
    } as const
  )[status];

  const detailsText =
    date &&
    (
      {
        pending: t` since ${date}`,
        success: t` on ${date} `,
        failed: t` on ${date}`,
        stalled: t` since ${date}`,
      } as const
    )[status];

  return (
    <Box>
      <StatusBar status={status} />
      <Box bg={bg} px="5" py="3">
        <Text variant="label03">
          <Text variant="label03" color={actionTextColor}>
            {actionText}
          </Text>
          {detailsText}
        </Text>
      </Box>
    </Box>
  );
}
