import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { useLingui } from '@lingui/react';
import { useRouter } from 'expo-router';

import { Badge, PressableProps } from '@leather.io/ui/native';

interface NetworkBadgeProps extends PressableProps {}
export function NetworkBadge(props: NetworkBadgeProps) {
  const router = useRouter();
  const { i18n } = useLingui();
  const { networkPreference } = useSettings();
  if (networkPreference.id === 'mainnet') return null;
  return (
    <Badge
      variant="default"
      px="3"
      onPress={() => router.navigate(AppRoutes.SettingsNetworks)}
      dataTestId={TestId.networkBadge}
      title={i18n._({
        id: 'settings.header_network',
        message: '{network}',
        values: { network: networkPreference.name },
      })}
      {...props}
    />
  );
}
