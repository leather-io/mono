import { Balance } from '@/components/balance/balance';
import { useAccountBalance } from '@/queries/balance/account-balance.query';

import { AccountId } from '@leather.io/models';
import { TextProps } from '@leather.io/ui/native';

type AccountBalanceProps = AccountId & TextProps;

export function AccountBalance({ accountIndex, fingerprint, ...textProps }: AccountBalanceProps) {
  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });
  // TODO LEA-1726: handle balance loading & error states
  if (totalBalance.state !== 'success') return;
  return <Balance balance={totalBalance.value} variant="label01" {...textProps} />;
}
