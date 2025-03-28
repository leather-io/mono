import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

export function ActivityFooter() {
  return (
    <Box paddingHorizontal="5" paddingVertical="2">
      <Text variant="label01" color="ink.text-primary">
        {t({ id: 'activity.footer.title', message: "That's all!" })}
      </Text>
      <Text variant="label01" color="ink.text-subdued">
        {t({ id: 'activity.footer.subtitle', message: 'Have a good day!' })}
      </Text>
    </Box>
  );
}
