import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export function TokenDescription({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Text variant="label03">
        {t({
          id: 'token.details.description_title',
          message: 'Description',
        })}
      </Text>
      <Text variant="label02">{children}</Text>
    </Box>
  );
}
