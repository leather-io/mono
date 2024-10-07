import { t } from '@lingui/macro';

import { Cell, PlaceholderIcon } from '@leather.io/ui/native';

import SettingsScreenLayout from '../settings-screen.layout';

// TODO: Hook up to notifications service when available or use Expo?
export default function SettingsNotificationsScreen() {
  return (
    <SettingsScreenLayout>
      <Cell.Root
        title={t`Notification`}
        caption={t`Description`}
        icon={<PlaceholderIcon />}
        onPress={() => {}}
      >
        <Cell.Switch value={false} />
      </Cell.Root>
    </SettingsScreenLayout>
  );
}
