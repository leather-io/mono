import { memo, useMemo } from 'react';

import { styled } from 'leather-styles/jsx';

import { SkeletonLoader, shimmerStyles } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { PrivateText } from '@app/components/privacy/private-text';
import { useAccountTotalBalanceByAddressesQuery } from '@app/query/common/account-balance/account-balance.query';
import { createPolicyAddresses } from '@app/store/policy/policy-addresses';
import { type PolicyStore } from '@app/store/policy/policy-store.utils';

interface PolicyTotalBalanceProps {
  policy: PolicyStore;
}

export const PolicyTotalBalance = memo(function PolicyTotalBalance({
  policy,
}: PolicyTotalBalanceProps) {
  const account = useMemo(() => createPolicyAddresses(policy), [policy]);
  const { data: totalBalance, isLoading } = useAccountTotalBalanceByAddressesQuery(account);

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
