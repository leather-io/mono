import { t } from '@lingui/core/macro';
import dayjs from 'dayjs';

import { Box, Text } from '@leather.io/ui/native';

interface ActivityDateHeaderProps {
  timestamp: number;
}

function formatDateGroupLabel(timestampSeconds: number): string {
  const date = dayjs(timestampSeconds * 1000);
  const now = dayjs();
  const today = now.startOf('day');
  const yesterday = today.subtract(1, 'day');

  if (date.isAfter(today)) return t`Today`;
  if (date.isAfter(yesterday)) return t`Yesterday`;
  return date.format('MMM DD, YYYY');
}

export function getDateGroupKey(timestampSeconds: number): string {
  return dayjs(timestampSeconds * 1000)
    .startOf('day')
    .valueOf()
    .toString();
}

export function ActivityDateHeader({ timestamp }: ActivityDateHeaderProps) {
  return (
    <Box px="5" py="2">
      <Text variant="label03" color="ink.text-subdued">
        {formatDateGroupLabel(timestamp)}
      </Text>
    </Box>
  );
}
