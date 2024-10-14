import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export default function SendScreen() {
  return (
    <Box alignItems="center" bg="ink.background-primary" flex={1} justifyContent="center">
      <Text>
        {t({
          id: 'send.header_title',
          message: 'Send',
        })}
      </Text>
    </Box>
  );
}
