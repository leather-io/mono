import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';

import { Money } from '@leather.io/models';
import { PressableProps } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface Sip10TokenBalanceProps extends PressableProps {
  availableBalance: Money;
  fiatBalance: Money;
  symbol: string;
  name: string;
}
export function Sip10TokenBalance({
  availableBalance,
  fiatBalance,
  name,
  symbol,
  ...rest
}: Sip10TokenBalanceProps) {
  return (
    <TokenBalance
      ticker={symbol}
      icon={<TokenIcon ticker={symbol} />} // TODO LEA-1909: add images from uri
      tokenName={name}
      protocol="sip10"
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
      {...rest}
    />
  );
}
export function Sip10Balance() {
  const data = useSip10TotalBalance();

  // TODO: handle balance loading & error states
  if (data.state !== 'success') return;

  return data.value?.aggregateBalances.map((balance, index) => (
    <Sip10TokenBalance
      key={`${balance.asset.symbol}-${index}`}
      symbol={balance.asset.symbol}
      name={balance.asset.name}
      availableBalance={balance.sip10.availableBalance}
      fiatBalance={balance.usd.totalBalance}
      px="5"
      py="3"
    />
  ));
}
interface Sip10BalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function Sip10BalanceByAccount({ accountIndex, fingerprint }: Sip10BalanceByAccountProps) {
  const data = useSip10AccountBalance(fingerprint, accountIndex);

  // TODO: handle balance loading & error states
  if (data.state !== 'success') return;
  return data.value?.sip10s.map((balance, index) => (
    <Sip10TokenBalance
      key={`${balance.asset.symbol}-${index}`}
      symbol={balance.asset.symbol}
      name={balance.asset.name}
      availableBalance={balance.sip10.availableBalance}
      fiatBalance={balance.usd.totalBalance}
      px="5"
      py="3"
    />
  ));
}
