import { Balance } from '@/components/balance/balance';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { AllAccountBalances } from '@/features/balances/balances';
import { EmptyBalance } from '@/features/balances/token-balance';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { t } from '@lingui/macro';

export default function BalancesScreen() {
  const { totalBalance } = useTotalBalance();

  const pageTitle = t({
    id: 'balances.header_title',
    message: 'All tokens',
  });

  const balance = totalBalance.state === 'success' ? totalBalance.value : EmptyBalance;

  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={pageTitle}
      contentTitle={pageTitle}
      subtitle={
        <Balance
          balance={balance}
          isLoading={totalBalance.state === 'loading'}
          variant="heading03"
        />
      }
      isHeaderReversible={true}
    >
      <AllAccountBalances />
    </AnimatedHeaderScreenLayout>
  );
}
