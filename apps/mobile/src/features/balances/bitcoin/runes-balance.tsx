import { FetchState, FetchWrapper } from '@/components/loading';
import {
  useRunesAccountBalance,
  useRunesTotalBalance,
} from '@/queries/balance/runes-balance.query';

import { AccountId, Money } from '@leather.io/models';
import { RunesAccountBalance, RunesAggregateBalance } from '@leather.io/services';
import { PressableProps, RunesAvatarIcon } from '@leather.io/ui/native';

import { HardCap } from '../balances';
import { EmptyBalance, TokenBalance } from '../token-balance';

interface RunesTokenBalanceProps extends PressableProps {
  availableBalance: Money;
  fiatBalance: Money;
  symbol: string;
  name: string;
}
function RunesTokenBalance({
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

function RunesTokenBalanceError() {
  return (
    <TokenBalance
      ticker=""
      icon={<RunesAvatarIcon />}
      tokenName=""
      protocol="rune"
      fiatBalance={EmptyBalance}
      availableBalance={EmptyBalance}
    />
  );
}

interface RunesBalanceWrapperProps {
  data: FetchState<RunesAggregateBalance | RunesAccountBalance>;
  hardCap?: boolean;
}
function RunesBalanceWrapper({ data, hardCap }: RunesBalanceWrapperProps) {
  return (
    <FetchWrapper data={data} error={<RunesTokenBalanceError />}>
      {data.state === 'success' &&
        data.value.runes.map((balance, index) => {
          // FIXME LEA-2310: temporary hard cap for widget view pending sorting
          if (hardCap && index >= 1) return null;

          return (
            <RunesTokenBalance
              key={`${balance.asset.symbol}-${index}`}
              symbol={balance.asset.symbol}
              name={balance.asset.runeName}
              availableBalance={balance.crypto.availableBalance}
              fiatBalance={balance.fiat.availableBalance}
            />
          );
        })}
    </FetchWrapper>
  );
}

export function RunesBalance({ hardCap }: HardCap) {
  const data = useRunesTotalBalance();

  return <RunesBalanceWrapper data={data} hardCap={hardCap} />;
}

export function RunesBalanceByAccount({ hardCap, fingerprint, accountIndex }: AccountId & HardCap) {
  const data = useRunesAccountBalance(fingerprint, accountIndex);

  return <RunesBalanceWrapper data={data} hardCap={hardCap} />;
}
