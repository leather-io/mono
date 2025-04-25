import { Balance } from '@/components/balance/balance';
import { EmptyBalance } from '@/features/balances/token-balance';
import { useAccountBalance } from '@/queries/balance/account-balance.query';

import { AccountId } from '@leather.io/models';
import { TextProps } from '@leather.io/ui/native';

type AccountBalanceProps = AccountId & TextProps;

export function AccountBalance({ accountIndex, fingerprint, ...textProps }: AccountBalanceProps) {
  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });
  const balance = totalBalance.state === 'success' ? totalBalance.value : EmptyBalance;
  return (
    <Balance
      balance={balance}
      isLoading={totalBalance.state === 'loading'}
      variant="label01"
      {...textProps}
    />
  );
}
