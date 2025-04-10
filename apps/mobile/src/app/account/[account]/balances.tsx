import { Balance } from '@/components/balance/balance';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { AccountBalances } from '@/features/balances/balances';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { useLocalSearchParams } from 'expo-router';

import { configureAccountParamsSchema } from './index';

export default function BalancesScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);

  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });
  // TODO LEA-1726: Handle loading and error states
  if (totalBalance.state !== 'success') return;
  const pageTitle = t({
    id: 'balances.header_title',
    message: 'My tokens',
  });
  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={pageTitle}
      contentTitle={pageTitle}
      subtitle={<Balance balance={totalBalance.value} variant="heading03" />}
      isHeaderReversible={true}
    >
      <AccountBalances fingerprint={fingerprint} accountIndex={accountIndex} />
    </AnimatedHeaderScreenLayout>
  );
}
