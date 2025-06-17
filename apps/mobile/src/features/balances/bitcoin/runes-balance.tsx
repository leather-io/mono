import { FetchState } from '@/components/loading/fetch-state';
import { FetchWrapper } from '@/components/loading/fetch-wrapper';
import { BalanceViewProps } from '@/features/balances/balances';
import {
  useRunesAccountBalance,
  useRunesTotalBalance,
} from '@/queries/balance/runes-balance.query';
import { ViewMode } from '@/shared/types';

import { AccountId, Money } from '@leather.io/models';
import { RunesAccountBalance, RunesAggregateBalance } from '@leather.io/services';
import { PressableProps, RunesAvatarIcon } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface RunesTokenBalanceProps extends PressableProps {
  availableBalance?: Money;
  quoteBalance?: Money;
  symbol: string;
  name: string;
}
function RunesTokenBalance({
  availableBalance,
  quoteBalance,
  name,
  symbol,
}: RunesTokenBalanceProps) {
  return (
    <TokenBalance
      ticker={symbol}
      icon={<RunesAvatarIcon />}
      tokenName={name}
      quoteBalance={quoteBalance}
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
      quoteBalance={undefined}
      availableBalance={undefined}
    />
  );
}

interface RunesBalanceWrapperProps {
  data: FetchState<RunesAggregateBalance | RunesAccountBalance>;
  mode: ViewMode;
}
function RunesBalanceWrapper({ data, mode = 'full' }: RunesBalanceWrapperProps) {
  const displayLimit = mode === 'widget' ? 1 : undefined;
  return (
    <FetchWrapper data={data} error={<RunesTokenBalanceError />}>
      {data.state === 'success' &&
        data.value.runes.slice(0, displayLimit).map((balance, index) => {
          return (
            <RunesTokenBalance
              key={`${balance.asset.symbol}-${index}`}
              symbol={balance.asset.symbol}
              name={balance.asset.runeName}
              availableBalance={balance.crypto.availableBalance}
              quoteBalance={balance.quote.availableBalance}
            />
          );
        })}
    </FetchWrapper>
  );
}

export function RunesBalance({ mode }: BalanceViewProps) {
  const data = useRunesTotalBalance();

  return <RunesBalanceWrapper data={data} mode={mode} />;
}

export function RunesBalanceByAccount({
  mode,
  fingerprint,
  accountIndex,
}: AccountId & BalanceViewProps) {
  const data = useRunesAccountBalance(fingerprint, accountIndex);

  return <RunesBalanceWrapper data={data} mode={mode} />;
}
