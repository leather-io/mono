import { memo } from 'react';

import { styled } from 'leather-styles/jsx';

import type { AccountId } from '@leather.io/models';
import { SkeletonLoader, shimmerStyles } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { PrivateText } from '@app/components/privacy/private-text';
import { useAccountTotalBalanceQuery } from '@app/query/common/account-balance/account-balance.query';

interface AccountTotalBalanceProps {
  accountId: AccountId;
}
export const AccountTotalBalance = memo(function AccountTotalBalance({
  accountId,
}: AccountTotalBalanceProps) {
  const { data: totalBalance, isLoading } = useAccountTotalBalanceQuery(accountId);

  if (!isLoading && !totalBalance) return null;

  return (
    <SkeletonLoader height="20px" isLoading={isLoading}>
      <styled.span
        className={shimmerStyles}
        textStyle="label.02"
        data-state={isLoading ? 'loading' : undefined}
      >
        {totalBalance && <PrivateText>{formatCurrency(totalBalance)}</PrivateText>}
      </styled.span>
    </SkeletonLoader>
  );
});
