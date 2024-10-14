import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export default function ReceiveScreen() {
  return (
    <Box alignItems="center" bg="ink.background-primary" flex={1} justifyContent="center">
      <Text>
        {t({
          id: 'receive.header_title',
          message: 'Receive 💰',
        })}
      </Text>
    </Box>
  );
}
