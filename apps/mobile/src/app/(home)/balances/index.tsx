import { Balance } from '@/components/balance/balance';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { AllAccountBalances } from '@/features/balances/balances';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { t } from '@lingui/macro';

import { Text } from '@leather.io/ui/native';

export default function BalancesScreen() {
  const { totalBalance } = useTotalBalance();
  if (totalBalance.state !== 'success') return;
  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={
        <Text variant="label01" color="ink.text-primary">
          {t({ id: 'balances.header_title', message: 'My tokens' })}
        </Text>
      }
      subtitle={<Balance balance={totalBalance.value} variant="heading03" />}
      isHeaderReversible={true}
    >
      <AllAccountBalances />
    </AnimatedHeaderScreenLayout>
  );
}
