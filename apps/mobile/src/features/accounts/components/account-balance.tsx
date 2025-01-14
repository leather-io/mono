import { Balance } from '@/components/balance/balance';
import { AccountId } from '@/models/domain.model';
import { useAccountBalance } from '@/queries/balance/account-balance.query';

type AccountBalanceProps = AccountId;

export function AccountBalance({ accountIndex, fingerprint }: AccountBalanceProps) {
  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });
  // TODO: handle balance loading & error states
  if (totalBalance.state !== 'success') return;
  return <Balance balance={totalBalance.value} variant="label02" />;
}
