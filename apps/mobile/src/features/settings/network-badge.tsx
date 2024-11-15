import { AppRoutes } from '@/routes';
import { useSettings } from '@/store/settings/settings';
import { useLingui } from '@lingui/react';
import { useRouter } from 'expo-router';

import { Badge } from '@leather.io/ui/native';

export function NetworkBadge() {
  const router = useRouter();
  const { i18n } = useLingui();
  const { networkPreference } = useSettings();

  return (
    <Badge
      variant="default"
      px="3"
      onPress={() => router.navigate(AppRoutes.SettingsNetworks)}
      title={i18n._({
        id: 'settings.header_network',
        message: '{network}',
        values: { network: networkPreference.name },
      })}
    />
  );
}
