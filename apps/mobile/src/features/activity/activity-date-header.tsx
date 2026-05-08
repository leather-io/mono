import { t } from '@lingui/core/macro';

import { formatDateGroupLabel as formatDateGroupLabelBase } from '@leather.io/features';
import { Box, Text } from '@leather.io/ui/native';

export { getDateGroupKey } from '@leather.io/features';

interface ActivityDateHeaderProps {
  timestamp: number;
}

function formatDateGroupLabel(timestampSeconds: number): string {
  const label = formatDateGroupLabelBase(timestampSeconds);
  if (label === 'Today') return t`Today`;
  if (label === 'Yesterday') return t`Yesterday`;
  return label;
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
