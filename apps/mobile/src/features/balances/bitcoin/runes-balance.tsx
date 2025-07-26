import { FetchState, FetchWrapper } from '@/components/loading';
import { BalanceViewProps } from '@/features/balances/balances';
import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import {
  useRunesAccountBalance,
  useRunesTotalBalance,
} from '@/queries/balance/runes-balance.query';
import { ViewMode } from '@/shared/types';

import { AccountId } from '@leather.io/models';
import { RunesAccountBalance, RunesAggregateBalance } from '@leather.io/services';
import { RunesAvatarIcon } from '@leather.io/ui/native';

type RunesTokenBalanceProps = Omit<TokenBalanceProps, 'icon'>;

function RunesTokenBalance(props: RunesTokenBalanceProps) {
  return <TokenBalance icon={<RunesAvatarIcon />} {...props} />;
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
              ticker={balance.asset.symbol}
              tokenName={balance.asset.runeName}
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
