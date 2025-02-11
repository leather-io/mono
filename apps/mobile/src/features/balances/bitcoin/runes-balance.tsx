import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { AccountId } from '@/models/domain.model';
import {
  useRunesAccountBalance,
  useRunesTotalBalance,
} from '@/queries/balance/runes-balance.query';

import { Money } from '@leather.io/models';
import { PressableProps } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface RunesTokenBalanceProps extends PressableProps {
  availableBalance: Money;
  fiatBalance: Money;
  symbol: string;
  name: string;
}
export function RunesTokenBalance({
  availableBalance,
  fiatBalance,
  name,
  symbol,
  ...rest
}: RunesTokenBalanceProps) {
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
export function RunesBalance() {
  const data = useRunesTotalBalance();

  // TODO LEA-1726: handle balance loading & error states
  if (data.state !== 'success') return;

  return data.value.runes.map((balance, index) => (
    <RunesTokenBalance
      key={`${balance.asset.symbol}-${index}`}
      symbol={balance.asset.symbol}
      name={balance.asset.runeName}
      availableBalance={balance.crypto.availableBalance}
      fiatBalance={balance.fiat.totalBalance}
      px="5"
      py="3"
    />
  ));
}

export function RunesBalanceByAccount({ fingerprint, accountIndex }: AccountId) {
  const data = useRunesAccountBalance(fingerprint, accountIndex);

  // TODO LEA-1726: handle balance loading & error states
  if (data.state !== 'success') return;
  return data.value.runes.map((balance, index) => (
    <RunesTokenBalance
      key={`${balance.asset.symbol}-${index}`}
      symbol={balance.asset.symbol}
      name={balance.asset.spacedRuneName}
      availableBalance={balance.crypto.availableBalance}
      fiatBalance={balance.fiat.availableBalance}
      px="5"
      py="3"
    />
  ));
}
