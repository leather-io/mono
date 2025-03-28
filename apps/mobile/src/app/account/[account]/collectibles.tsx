import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { CollectiblesLayout } from '@/components/widgets/collectibles/collectibles.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { useLocalSearchParams } from 'expo-router';

import { Text } from '@leather.io/ui/native';

import { configureAccountParamsSchema } from './index';

export default function CollectiblesScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);

  const collectibles = useAccountCollectibles(fingerprint, accountIndex);

  // TODO LEA-1726: Handle loading and error states
  if (collectibles.state !== 'success') return null;

  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={
        <Text variant="label01" color="ink.text-primary">
          {t({ id: 'collectibles.header_title', message: 'My collectibles' })}
        </Text>
      }
    >
      <CollectiblesLayout collectibles={collectibles.value} />
    </AnimatedHeaderScreenLayout>
  );
}
