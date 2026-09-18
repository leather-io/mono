import { Stack } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';
import { Divider } from '@app/components/layout/divider';

import { TokenDetailsBalanceItem } from './token-details-balance-item';

export interface TokenBalanceEntry {
  title: string;
  amount: Money;
  fiatAmount?: Money;
  caption?: string;
  tooltipText?: string;
  onPressRow?(): void;
  testId?: string;
}

export interface TokenAddressEntry {
  title: string;
  address: string;
  amount: Money;
  fiatAmount: Money;
  onPressAddress(): void;
  onPressRow?(): void;
}

interface TokenBalancesTabProps {
  balances: TokenBalanceEntry[];
  addresses?: TokenAddressEntry[];
  formatAmount(amount: Money): string;
}

export function TokenBalancesTab({
  balances,
  addresses = [],
  formatAmount,
}: TokenBalancesTabProps) {
  return (
    <Stack gap="space.00">
      {addresses.length > 0 ? (
        <>
          <Stack gap="space.00" py="space.02">
            {addresses.map(entry => (
              <TokenDetailsBalanceItem
                key={entry.address}
                title={entry.title}
                address={entry.address}
                rightTop={formatAmount(entry.amount)}
                rightBottom={formatCurrency(entry.fiatAmount)}
                onPressAddress={entry.onPressAddress}
                onPressRow={entry.onPressRow}
              />
            ))}
          </Stack>
          <Divider />
        </>
      ) : null}
      <Stack gap="space.00" py="space.02">
        {balances.map(balance => (
          <TokenDetailsBalanceItem
            key={balance.title}
            title={balance.title}
            caption={balance.caption}
            tooltipText={balance.tooltipText}
            rightTop={formatAmount(balance.amount)}
            rightBottom={balance.fiatAmount ? formatCurrency(balance.fiatAmount) : undefined}
            onPressRow={balance.onPressRow}
            testId={balance.testId}
          />
        ))}
      </Stack>
    </Stack>
  );
}
