import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { Collectibles } from '@/features/collectibles';
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

  const pageTitle = t({
    id: 'account.collectibles.header_title',
    message: 'Collectibles',
  });

  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={pageTitle}
      contentTitle={pageTitle}
    >
      <Collectibles collectibles={collectibles} />
    </AnimatedHeaderScreenLayout>
  );
}
