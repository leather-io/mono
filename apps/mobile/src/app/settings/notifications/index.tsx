import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { Box, PlaceholderIcon } from '@leather.io/ui/native';

export default function SettingsNotificationsScreen() {
  const { changeNotificationsPreference, notificationsPreference } = useSettings();
  return (
    <Box bg="ink.background-primary" flex={1}>
      <Box flex={1} gap="3" paddingTop="5">
        <SettingsListItem
          title={t`Transaction confirmations`}
          caption={t`Receive notifications about transactions`}
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
