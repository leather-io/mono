import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { Caption } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { useSwitchAccount } from '@app/common/hooks/account/use-switch-account';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { PolicyTotalBalance } from '@app/components/account/policy-total-balance';
import { type PolicyStore, parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { usePolicyDisplayName } from '@app/store/policy/policy.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

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
      dataTestId={SettingsSelectors.SwitchAccountPolicyItem.replace('[id]', policy.id)}
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
