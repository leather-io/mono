import { t } from '@lingui/macro';

import { Box, Cell, PlaceholderIcon } from '@leather.io/ui/native';

export default function SettingsNotificationsScreen() {
  return (
    <Box bg="ink.background-primary" flex={1}>
      <Box flex={1} gap="3" paddingHorizontal="5" paddingTop="5">
        <Cell.Root
          title={t({
            id: 'notifications.push.cell_title',
            message: 'Notification',
          })}
          caption={t({
            id: 'notifications.push.cell_caption',
            message: 'Placeholder',
          })}
          icon={<PlaceholderIcon />}
          onPress={() => {}}
        >
          <Cell.Switch value={false} />
        </Cell.Root>
      </Box>
    </Box>
  );
}
