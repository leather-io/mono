import { memo } from 'react';
import { useSelector } from 'react-redux';

import { useFormikContext } from 'formik';

import type { AccountId } from '@leather.io/models';

import { BitcoinSendFormValues, StacksSendFormValues } from '@shared/models/form.model';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { useNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';
import { selectCurrentAccount } from '@app/store/software-keys/software-key.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface AccountListItemProps {
  stacksAccount: StacksAccount;
  accountId: AccountId;
  onClose(): void;
}
export const AccountListItem = memo(function AccountListItem({
  accountId,
  stacksAccount,
  onClose,
}: AccountListItemProps) {
  const { setFieldValue, values } = useFormikContext<
    BitcoinSendFormValues | StacksSendFormValues
  >();
  const currentAccount = useSelector(selectCurrentAccount);
  const stacksAddress = stacksAccount.address;
  const { data: name } = useAccountDisplayName({
    address: stacksAccount.address,
    index: accountId.accountIndex,
    fingerprint: accountId.fingerprint,
  });
  const bitcoinSigner = useNativeSegwitPayer(accountId);
  const bitcoinAddress = bitcoinSigner?.({ changeIndex: 0, addressIndex: 0 }).address || '';

  function onSelectAccount() {
    const isBitcoin = values.symbol === 'BTC';
    void setFieldValue('recipient', isBitcoin ? bitcoinAddress : stacksAddress, false);
    onClose();
  }

  return (
    <AccountListItemLayout
      fingerprint={currentAccount.fingerprint}
      accountIndex={accountId.accountIndex}
      accountAddresses={<AccountAddresses accountId={accountId} />}
      accountName={<AccountNameLayout>{name}</AccountNameLayout>}
      avatar={
        <AccountAvatarItem
          index={accountId.accountIndex}
          publicKey={stacksAccount?.stxPublicKey || ''}
        />
      }
      balanceLabel={<AccountTotalBalance accountId={accountId} />}
      isSelected={false}
      isLoading={false}
      onSelectAccount={onSelectAccount}
    />
  );
});
