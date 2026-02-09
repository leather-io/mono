import { Balance } from '@/components/balance/balance';
import { Loading } from '@/components/loading/loading';

import { Money } from '@leather.io/models';
import { Cell } from '@leather.io/ui/native';

import { TokenCell, type TokenCellProps } from './token-cell';

export interface TokenBalanceProps extends Omit<TokenCellProps, 'asideComponent'> {
  availableBalance?: Money;
  quoteBalance?: Money;
  isLoading?: boolean;
  forceBalanceVisible?: boolean;
}
export function TokenBalance({
  availableBalance,
  quoteBalance,
  isLoading,
  forceBalanceVisible = false,
  ...rest
}: TokenBalanceProps) {
  if (isLoading) return <Loading />;

  return (
    <TokenCell
      asideComponent={
        <Cell.Aside>
          <Cell.Label variant="primary">
            <Balance
              balance={quoteBalance}
              variant="label02"
              lineHeight={16}
              forceVisible={forceBalanceVisible}
            />
          </Cell.Label>
          <Cell.Label variant="secondary">
            <Balance
              balance={availableBalance}
              variant="caption01"
              formattingOptions={{ preset: 'shorthand-balance', showCurrency: false }}
              forceVisible={forceBalanceVisible}
            />
          </Cell.Label>
        </Cell.Aside>
      }
      {...rest}
    />
  );
}
