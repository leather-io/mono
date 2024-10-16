import { TokensIcon } from '@/components/widgets/tokens/tokens-icon';
import { AccountId } from '@/models/domain.model';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import { useGetStacksAddresses } from '@/queries/balance/use-total-balance';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';

import { TokenBalance } from '../token-balance';

interface StacksTokenBalanceProps {
  availableBalance: Money;
  fiatBalance: Money;
}
export function StacksTokenBalance({ availableBalance, fiatBalance }: StacksTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="STX"
      icon={<TokensIcon ticker="STX" />}
      tokenName={t`Stacks`}
      chain={t`Stacks blockchain`}
      fiatBalance={fiatBalance}
      showChain={false}
      availableBalance={availableBalance}
    />
  );
}

export function StacksBalance() {
  const addresses = useGetStacksAddresses();
  const { availableBalance, fiatBalance } = useStxBalance(addresses);
  return <StacksTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />;
}

export function StacksBalanceByAccount(props: AccountId) {
  const addresses = useGetStacksAddresses(props);
  const { availableBalance, fiatBalance } = useStxBalance(addresses);
  return <StacksTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />;
}
