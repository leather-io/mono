import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import {
  useSip10AggregateBalanceQuery,
  useSip10BalancesQuery,
} from '@/queries/balance/sip10-balance.query';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';

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
  const addresses = useStacksSignerAddresses();
  const { isFetching, data } = useSip10AggregateBalanceQuery(addresses);

  if (isFetching) {
    return null;
  }

  return data?.balances.map(balances =>
    balances.balances.map((balance, index) => (
      <Sip10TokenBalance
        key={`${balance.info.symbol}-${index}`}
        symbol={balance.info.symbol}
        name={balance.info.name}
        availableBalance={balance.sip10.availableBalance}
        fiatBalance={balance.usd.totalBalance}
        px="5"
        py="3"
      />
    ))
  );
}

interface Sip10BalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function Sip10BalanceByAccount({ accountIndex, fingerprint }: Sip10BalanceByAccountProps) {
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);
  if (!address) {
    throw new Error('Stacks address not found');
  }
  const { isFetching, data } = useSip10BalancesQuery(address);
  if (isFetching) {
    return null;
  }
  return data?.balances.map((balance, index) => (
    <Sip10TokenBalance
      key={`${balance.info.symbol}-${index}`}
      symbol={balance.info.symbol}
      name={balance.info.name}
      availableBalance={balance.sip10.availableBalance}
      fiatBalance={balance.usd.totalBalance}
      px="5"
      py="3"
    />
  ));
}
