import { memo } from 'react';

import { styled } from 'leather-styles/jsx';

import { SkeletonLoader, shimmerStyles } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { PrivateText } from '@app/components/privacy/private-text';
import { useAccountTotalBalance } from '@app/query/common/account-balance/account-balance.query';

interface AccountTotalBalanceProps {
  accountIndex: number;
}

export const AccountTotalBalance = memo(function AccountTotalBalance({
  accountIndex,
}: AccountTotalBalanceProps) {
  const accountTotalBalance = useAccountTotalBalance(accountIndex);

  if (!accountTotalBalance.isLoading && !accountTotalBalance.data) return null;

  return (
    <SkeletonLoader height="20px" isLoading={accountTotalBalance.isLoading}>
      <styled.span
        className={shimmerStyles}
        textStyle="label.02"
        data-state={accountTotalBalance.isLoading ? 'loading' : undefined}
      >
        {accountTotalBalance.data && (
          <PrivateText>{formatCurrency(accountTotalBalance.data)}</PrivateText>
        )}
      </styled.span>
    </SkeletonLoader>
  );
});
