import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { Collectibles } from '@/features/collectibles';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useTotalCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { t } from '@lingui/macro';

export default function CollectiblesScreen() {
  const collectibles = useTotalCollectibles();
  const pageTitle = t({
    id: 'collectibles.header_title',
    message: 'All collectibles',
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
