import { useFormikContext } from 'formik';

import { Caption } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { BitcoinSendFormValues, StacksSendFormValues } from '@shared/models/form.model';

import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { PolicyTotalBalance } from '@app/components/account/policy-total-balance';
import { type PolicyStore, parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { usePolicyDisplayName } from '@app/store/policy/policy.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface PolicyListItemProps {
  policy: PolicyStore;
  onClose(): void;
}
export function PolicyListItem({ policy, onClose }: PolicyListItemProps) {
  const { setFieldValue } = useFormikContext<BitcoinSendFormValues | StacksSendFormValues>();
  const parent = parsePolicyParent(policy.parentAccountId);
  const displayName = usePolicyDisplayName(policy);

  function onSelectAccount() {
    void setFieldValue('recipient', policy.address, false);
    onClose();
  }

  return (
    <AccountListItemLayout
      {...parent}
      accountAddresses={<Caption>{truncateMiddle(policy.address, 5)}</Caption>}
      accountName={<AccountNameLayout>{displayName}</AccountNameLayout>}
      avatar={<AccountAvatarItem index={parent.accountIndex} publicKey={policy.address} />}
      balanceLabel={<PolicyTotalBalance policy={policy} />}
      isLoading={false}
      isSelected={false}
      onSelectAccount={onSelectAccount}
    />
  );
}
