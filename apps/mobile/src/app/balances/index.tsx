import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { AllAccountBalances } from '@/features/balances/balances';
import { TotalBalance } from '@/features/balances/total-balance';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/macro';

export default function BalancesScreen() {
  const pageTitle = t({
    id: 'balances.header_title',
    message: 'All tokens',
  });

  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={pageTitle}
      contentTitle={pageTitle}
      subtitle={<TotalBalance variant="heading03" />}
      isHeaderReversible={true}
    >
      <AllAccountBalances />
    </AnimatedHeaderScreenLayout>
  );
}
