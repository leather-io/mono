import { memo, useMemo } from 'react';

import { styled } from 'leather-styles/jsx';

import { Caption, SkeletonLoader, shimmerStyles } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useSwitchAccount } from '@app/common/hooks/account/use-switch-account';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { PrivateText } from '@app/components/privacy/private-text';
import { useAccountTotalBalanceByAddressesQuery } from '@app/query/common/account-balance/account-balance.query';
import { createPolicyAddresses } from '@app/store/policy/policy-addresses';
import { type PolicyStore, parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { usePolicyDisplayName } from '@app/store/policy/policy.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface PolicyTotalBalanceProps {
  policy: PolicyStore;
}

const PolicyTotalBalance = memo(function PolicyTotalBalance({ policy }: PolicyTotalBalanceProps) {
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

interface PolicyListItemProps {
  policy: PolicyStore;
  nonInteractive?: boolean;
  handleClose(): void;
  hideBalance?: boolean;
}
export function PolicyListItem({
  policy,
  nonInteractive,
  handleClose,
  hideBalance,
}: PolicyListItemProps) {
  const { handleSwitchToPolicy, getIsPolicyActive } = useSwitchAccount(handleClose);
  const parent = parsePolicyParent(policy.parentAccountId);
  const displayName = usePolicyDisplayName(policy);

  return (
    <AccountListItemLayout
      {...parent}
      accountAddresses={<Caption>{truncateMiddle(policy.address, 5)}</Caption>}
      accountName={<AccountNameLayout>{displayName}</AccountNameLayout>}
      avatar={<AccountAvatarItem index={parent.accountIndex} publicKey={policy.address} />}
      balanceLabel={hideBalance ? null : <PolicyTotalBalance policy={policy} />}
      nonInteractive={nonInteractive}
      isLoading={false}
      isSelected={getIsPolicyActive(policy.id)}
      onSelectAccount={() => handleSwitchToPolicy(policy)}
    />
  );
}
