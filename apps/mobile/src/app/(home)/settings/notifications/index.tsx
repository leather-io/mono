import { SettingsListItem } from '@/components/settings/settings-list-item';
import { t } from '@lingui/macro';

import { Box, PlaceholderIcon } from '@leather.io/ui/native';

export default function SettingsNotificationsScreen() {
  return (
    <Box bg="ink.background-primary" flex={1}>
      <Box flex={1} gap="3" paddingTop="5">
        <SettingsListItem
          title={t({
            id: 'notifications.push.cell_title',
            message: 'Notification',
          })}
          caption={t({
            id: 'notifications.push.cell_caption',
            message: 'Placeholder',
          })}
          icon={<PlaceholderIcon />}
          type="switch"
          switchValue={false}
          onSwitchValueChange={() => {}}
        />
      </Box>
    </Box>
  );
}
