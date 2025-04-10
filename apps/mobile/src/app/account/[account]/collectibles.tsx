import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { CollectiblesLayout } from '@/components/widgets/collectibles/collectibles.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { useLocalSearchParams } from 'expo-router';

import { configureAccountParamsSchema } from './index';

export default function CollectiblesScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);

  const collectibles = useAccountCollectibles(fingerprint, accountIndex);

  // TODO LEA-1726: Handle loading and error states
  if (collectibles.state !== 'success') return null;

  const pageTitle = t({
    id: 'collectibles.header_title',
    message: 'My collectibles',
  });

  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={pageTitle}
      contentTitle={pageTitle}
    >
      <CollectiblesLayout collectibles={collectibles.value} />
    </AnimatedHeaderScreenLayout>
  );
}
