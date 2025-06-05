import { Balance } from '@/components/balance/balance';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { AccountLookup } from '@/shared/types';

import { TextProps } from '@leather.io/ui/native';

export function TotalBalance({ ...props }: TextProps) {
  const { totalBalance } = useTotalBalance();

  const balance = totalBalance.state === 'success' ? totalBalance.value : undefined;
  return (
    <Balance
      balance={balance}
      isLoading={totalBalance.state === 'loading'}
      {...props}
      isQuoteCurrency
    />
  );
}

interface AccountBalanceProps extends AccountLookup, TextProps {}

export function AccountBalance({ fingerprint, accountIndex, ...props }: AccountBalanceProps) {
  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });

  const balance = totalBalance.state === 'success' ? totalBalance.value : undefined;
  return (
    <Balance
      balance={balance}
      isLoading={totalBalance.state === 'loading'}
      {...props}
      isQuoteCurrency
    />
  );
}
