import {
  useRunesAccountBalance,
  useRunesTotalBalance,
} from '@/queries/balance/runes-balance.query';

import { AccountId, Money } from '@leather.io/models';
import { PressableProps, RunesAvatarIcon } from '@leather.io/ui/native';

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
}: RunesTokenBalanceProps) {
  return (
    <TokenBalance
      ticker={symbol}
      icon={<RunesAvatarIcon />}
      tokenName={name}
      protocol="rune"
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
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
    />
  ));
}
