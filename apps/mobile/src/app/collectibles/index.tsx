import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { PageLayout } from '@/components/page/page.layout';
import { Collectibles } from '@/features/collectibles/collectibles';
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
    <PageLayout>
      <AnimatedHeaderScreenLayout
        contentContainerStyles={{ paddingHorizontal: 0 }}
        rightHeaderElement={<NetworkBadge />}
        title={pageTitle}
        contentTitle={pageTitle}
        contentTitleStyles={{ paddingLeft: '5' }}
      >
        <Collectibles collectibles={collectibles} />
      </AnimatedHeaderScreenLayout>
    </PageLayout>
  );
}
