import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Box, styled } from 'leather-styles/jsx';

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
  unavailable?: boolean;
}
export function PolicyListItem({
  policy,
  nonInteractive,
  handleClose,
  hideBalance,
  unavailable,
}: PolicyListItemProps) {
  const { handleSwitchToPolicy, getIsPolicyActive } = useSwitchAccount(handleClose);
  const parent = parsePolicyParent(policy.parentAccountId);
  const displayName = usePolicyDisplayName(policy);

  const avatar = <AccountAvatarItem index={parent.accountIndex} publicKey={policy.address} />;
  const balance = <PolicyTotalBalance policy={policy} />;

  function renderBalance() {
    if (hideBalance) return null;
    if (unavailable) return <styled.span color="ink.text-non-interactive">{balance}</styled.span>;
    return balance;
  }

  return (
    <AccountListItemLayout
      {...parent}
      dataTestId={SettingsSelectors.SwitchAccountPolicyItem.replace('[id]', policy.id)}
      accountAddresses={
        unavailable ? (
          <Caption color="ink.text-secondary">Can't connect to this app</Caption>
        ) : (
          <Caption>{truncateMiddle(policy.address, 5)}</Caption>
        )
      }
      accountName={
        <AccountNameLayout color={unavailable ? 'ink.text-non-interactive' : undefined}>
          {displayName}
        </AccountNameLayout>
      }
      avatar={unavailable ? <Box opacity={0.5}>{avatar}</Box> : avatar}
      balanceLabel={renderBalance()}
      nonInteractive={nonInteractive}
      isLoading={false}
      isSelected={!unavailable && getIsPolicyActive(policy.id)}
      onSelectAccount={() => handleSwitchToPolicy(policy)}
    />
  );
}
