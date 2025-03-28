import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export default function SwapScreen() {
  return (
    <Box alignItems="center" bg="ink.background-primary" flex={1} justifyContent="center">
      <Text>
        {t({
          id: 'swap.header_title',
          message: 'Swap',
        })}
      </Text>
    </Box>
  );
}
