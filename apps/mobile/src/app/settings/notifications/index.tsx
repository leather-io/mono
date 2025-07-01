import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { Box, PlaceholderIcon } from '@leather.io/ui/native';

export default function SettingsNotificationsScreen() {
  const { changeNotificationsPreference, notificationsPreference } = useSettings();
  return (
    <Box bg="ink.background-primary" flex={1}>
      <Box flex={1} gap="3" paddingTop="5">
        <SettingsListItem
          title={t({
            id: 'notifications.push.cell_title',
            message: 'Transaction confirmations',
          })}
          caption={t({
            id: 'notifications.push.cell_caption',
            message: 'Receive notifications about transactions',
          })}
          icon={<PlaceholderIcon />}
          type="switch"
          switchValue={notificationsPreference === 'enabled'}
          onSwitchValueChange={isEnabled => {
            changeNotificationsPreference(isEnabled ? 'enabled' : 'disabled');
          }}
        />
      </Box>
    </Box>
  );
}
