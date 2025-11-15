import { t } from '@lingui/core/macro';

import { Box, Text } from '@leather.io/ui/native';

export function QuotePreviewEmptyState() {
  return (
    <Box backgroundColor="yellow.background-primary" borderRadius="sm" p="4" gap="2">
      <Text variant="label03">{t`No quotes available for this swap.`}</Text>
      <Text variant="caption01">
        {t`Not enough liquidity or no route available right now. Try a smaller amount or check back in a few minutes.`}
      </Text>
    </Box>
  );
}
