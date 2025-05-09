import { Balance } from '@/components/balance/balance';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { AccountBalances } from '@/features/balances/balances';
import { EmptyBalance } from '@/features/balances/token-balance';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { useLocalSearchParams } from 'expo-router';

import { SkeletonLoader } from '@leather.io/ui/native';

import { configureAccountParamsSchema } from './index';

export default function BalancesScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);

  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });

  const pageTitle = t({
    id: 'balances.header_title',
    message: 'All tokens',
  });
  const isLoading = totalBalance.state === 'loading';
  const balance = totalBalance.state === 'success' ? totalBalance.value : EmptyBalance;
  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={pageTitle}
      contentTitle={pageTitle}
      subtitle={
        isLoading ? (
          <SkeletonLoader width={55} height={24} isLoading={isLoading} />
        ) : (
          <Balance balance={balance} variant="heading03" />
        )
      }
      isHeaderReversible={true}
    >
      <AccountBalances fingerprint={fingerprint} accountIndex={accountIndex} />
    </AnimatedHeaderScreenLayout>
  );
}
