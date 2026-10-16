import { Balance } from '@/components/balance/balance';
import { useAccountTotalBalance } from '@/queries/balance/account-balance.query';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { type AccountLookup } from '@/shared/types';

import { SkeletonLoader, type TextProps } from '@leather.io/ui/native';

export function TotalBalance(props: TextProps) {
  const { totalBalance } = useTotalBalance();

  const balance = totalBalance.state === 'success' ? totalBalance.value : undefined;
  return (
    <SkeletonLoader height={20} width={100} isLoading={totalBalance.state === 'loading'}>
      <Balance balance={balance} {...props} />
    </SkeletonLoader>
  );
}

interface AccountBalanceProps extends AccountLookup, TextProps {}

export function AccountBalance({ fingerprint, accountIndex, ...props }: AccountBalanceProps) {
  const totalBalance = useAccountTotalBalance({ fingerprint, accountIndex });

  const balance = totalBalance.state === 'success' ? totalBalance.value : undefined;
  return (
    <SkeletonLoader height={20} width={100} isLoading={totalBalance.state === 'loading'}>
      <Balance balance={balance} {...props} />
    </SkeletonLoader>
  );
}
