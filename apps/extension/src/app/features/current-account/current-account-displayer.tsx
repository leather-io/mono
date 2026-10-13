import { useSelector } from 'react-redux';

import { AccountSelectors } from '@tests/selectors/account.selectors';

import { Caption } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { getLedgerAccountIndicator } from '@app/components/account/ledger-account-indicator';
import { PolicyTotalBalance } from '@app/components/account/policy-total-balance';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { type PolicyStore, parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { useCurrentPolicy, usePolicyDisplayName } from '@app/store/policy/policy.selectors';
import { selectCurrentAccount } from '@app/store/software-keys/software-key.selectors';
import { useWalletEntities } from '@app/store/wallets/wallet.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface CurrentAccountDisplayerProps {
  onSelectAccount(): void;
  allowPolicyAccounts?: boolean;
}

function CurrentPolicyDisplayer({
  policy,
  onSelectAccount,
}: CurrentAccountDisplayerProps & { policy: PolicyStore }) {
  const parent = parsePolicyParent(policy.parentAccountId);
  const displayName = usePolicyDisplayName(policy);
  return (
    <AccountListItemLayout
      {...parent}
      accountAddresses={<Caption>{truncateMiddle(policy.address, 5)}</Caption>}
      accountName={<AccountNameLayout>{displayName}</AccountNameLayout>}
      avatar={<AccountAvatarItem index={parent.accountIndex} publicKey={policy.address} />}
      balanceLabel={<PolicyTotalBalance policy={policy} />}
      isLoading={false}
      isSelected={false}
      onSelectAccount={() => onSelectAccount()}
      showChevron
    />
  );
}

function CurrentSingleSigAccountDisplayer({ onSelectAccount }: CurrentAccountDisplayerProps) {
  const current = useCurrentAccountId();

  const currentAccount = useSelector(selectCurrentAccount);
  const stacksAccount = useStacksAccount(currentAccount);
  const walletEntities = useWalletEntities();
  const walletType = walletEntities[current.fingerprint]?.type;
  const { data: name } = useAccountDisplayName({
    address: stacksAccount?.address,
    index: current.accountIndex,
    fingerprint: current.fingerprint,
  });
  return (
    <AccountListItemLayout
      fingerprint={currentAccount.fingerprint}
      accountIndex={current.accountIndex}
      accountAddresses={<AccountAddresses accountId={current} />}
      accountName={<AccountNameLayout isLoading={false}>{name}</AccountNameLayout>}
      avatar={
        <AccountAvatarItem
          index={current.accountIndex}
          publicKey={stacksAccount?.stxPublicKey || ''}
          indicator={getLedgerAccountIndicator(walletType, AccountSelectors.LedgerIndicator)}
        />
      }
      balanceLabel={<AccountTotalBalance accountId={current} />}
      isLoading={false}
      isSelected={false}
      onSelectAccount={() => onSelectAccount()}
      showChevron
    />
  );
}

export function CurrentAccountDisplayer({
  onSelectAccount,
  allowPolicyAccounts = false,
}: CurrentAccountDisplayerProps) {
  const currentPolicy = useCurrentPolicy();

  if (allowPolicyAccounts && currentPolicy)
    return <CurrentPolicyDisplayer policy={currentPolicy} onSelectAccount={onSelectAccount} />;

  return <CurrentSingleSigAccountDisplayer onSelectAccount={onSelectAccount} />;
}
