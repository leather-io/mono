import { t } from '@lingui/macro';

import { Cell, PlaceholderIcon } from '@leather.io/ui/native';

import SettingsScreenLayout from '../settings-screen.layout';

// TODO: Hook up to notifications service when available or use Expo?
export default function SettingsNotificationsScreen() {
  return (
    <SettingsScreenLayout>
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
    </SettingsScreenLayout>
  );
}
