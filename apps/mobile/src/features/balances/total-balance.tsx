import { Balance } from '@/components/balance/balance';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { AccountLookup } from '@/shared/types';

import { TextProps } from '@leather.io/ui/native';

interface AccountBalanceProps extends AccountLookup, TextProps {}

export function AccountBalance({ fingerprint, accountIndex, ...props }: AccountBalanceProps) {
  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });

  const balance = totalBalance.state === 'success' ? totalBalance.value : undefined;
  return <Balance balance={balance} isLoading={totalBalance.state === 'loading'} {...props} />;
}
