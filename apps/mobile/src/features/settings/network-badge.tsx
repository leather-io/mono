import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { useLingui } from '@lingui/react';
import { useRouter } from 'expo-router';

import { Badge, type BadgeProps, Pressable } from '@leather.io/ui/native';

type NetworkBadgeProps = Omit<BadgeProps, 'label'>;

export function NetworkBadge(props: NetworkBadgeProps) {
  const router = useRouter();
  const { i18n } = useLingui();
  const { networkPreference } = useSettings();
  if (networkPreference.id === 'mainnet') return null;

  return (
    <Pressable onPress={() => router.navigate(AppRoutes.SettingsNetworks)}>
      <Badge
        testID={TestId.networkBadge}
        label={i18n._({
          id: 'settings.header_network',
          message: '{network}',
          values: { network: networkPreference.name },
        })}
        {...props}
      />
    </Pressable>
  );
}
