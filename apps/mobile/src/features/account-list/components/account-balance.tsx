import { Balance } from '@/components/balance/balance';
import { AccountId } from '@/models/domain.model';
import { useAccountTotalBalance } from '@/queries/balance/total-balance.query';

type AccountBalanceProps = AccountId;

export function AccountBalance({ accountIndex, fingerprint }: AccountBalanceProps) {
  const { totalBalance } = useAccountTotalBalance({ fingerprint, accountIndex });
  console.log('accountIndex', accountIndex, 'totalBalance', totalBalance);
  return <Balance balance={totalBalance} variant="label02" />;
}
