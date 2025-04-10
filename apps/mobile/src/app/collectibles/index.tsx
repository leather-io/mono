import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { CollectiblesLayout } from '@/components/widgets/collectibles/collectibles.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useTotalCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { t } from '@lingui/macro';

export default function CollectiblesScreen() {
  const { value: collectibles, state } = useTotalCollectibles();
  // TODO LEA-1726: Handle loading and error states
  if (state !== 'success') return;
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
      <CollectiblesLayout collectibles={collectibles} />
    </AnimatedHeaderScreenLayout>
  );
}
