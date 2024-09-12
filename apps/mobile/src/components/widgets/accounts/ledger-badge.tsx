import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Text, Theme } from '@leather.io/ui/native';

export function LedgerBadge() {
  const theme = useTheme<Theme>();
  return (
    <Box
      position="absolute"
      p="1"
      borderColor="ink.border-transparent"
      borderRadius="xs"
      borderWidth={1}
      right={theme.spacing[5]}
      top={theme.spacing[5]}
    >
      <Text variant="label03" color="ink.text-subdued">
        {t`Ledger`}
      </Text>
    </Box>
  );
}
