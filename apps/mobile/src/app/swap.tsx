import { useEffect } from 'react';

import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export default function SwapScreen() {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('SwapScreen');
  }, []);
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
