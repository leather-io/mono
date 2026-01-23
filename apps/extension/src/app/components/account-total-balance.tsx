import { memo } from 'react';

import { styled } from 'leather-styles/jsx';

import type { AccountId } from '@leather.io/models';
import { SkeletonLoader, shimmerStyles } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { PrivateText } from '@app/components/privacy/private-text';
import { useAccountTotalBalance } from '@app/query/common/account-balance/account-balance.query';

interface AccountTotalBalanceProps {
  accountId: AccountId;
}
export const AccountTotalBalance = memo(function AccountTotalBalance({
  accountId,
}: AccountTotalBalanceProps) {
  const accountTotalBalance = useAccountTotalBalance(accountId);

  if (accountTotalBalance.state !== 'loading' && !accountTotalBalance.value) return null;

  return (
    <SkeletonLoader height="20px" isLoading={accountTotalBalance.state === 'loading'}>
      <styled.span
        className={shimmerStyles}
        textStyle="label.02"
        data-state={accountTotalBalance.state === 'loading' ? 'loading' : undefined}
      >
        {accountTotalBalance.value && (
          <PrivateText>{formatCurrency(accountTotalBalance.value)}</PrivateText>
        )}
      </styled.span>
    </SkeletonLoader>
  );
});
