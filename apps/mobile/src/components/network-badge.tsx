import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { useRouter } from 'expo-router';

import { Badge, type BadgeProps, Pressable } from '@leather.io/ui/native';

type NetworkBadgeProps = Omit<BadgeProps, 'label'>;

export function NetworkBadge(props: NetworkBadgeProps) {
  const router = useRouter();
  const { networkPreference } = useSettings();
  if (networkPreference.id === 'mainnet') return null;

  return (
    <Pressable onPress={() => router.navigate('/settings/networks')}>
      <Badge testID={TestId.networkBadge} label={networkPreference.name} mr="2" {...props} />
    </Pressable>
  );
}
