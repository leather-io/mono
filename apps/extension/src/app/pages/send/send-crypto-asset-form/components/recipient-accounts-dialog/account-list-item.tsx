import { memo } from 'react';

import { useFormikContext } from 'formik';

import type { AccountId } from '@leather.io/models';

import { BitcoinSendFormValues, StacksSendFormValues } from '@shared/models/form.model';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { useNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { WalletType } from '@app/store/common/wallet-type.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface AccountListItemProps {
  accountId: AccountId;
  walletType: WalletType;
  onClose(): void;
}
export const AccountListItem = memo(function AccountListItem({
  accountId,
  walletType,
  onClose,
}: AccountListItemProps) {
  const { setFieldValue, values } = useFormikContext<
    BitcoinSendFormValues | StacksSendFormValues
  >();
  const stacksAccount = useStacksAccount(accountId);
  const bitcoinSigner = useNativeSegwitPayer(accountId);
  const { data: name } = useAccountDisplayName({
    address: stacksAccount?.address,
    index: accountId.accountIndex,
    fingerprint: accountId.fingerprint,
  });

  function onSelectAccount() {
    const isBitcoin = values.symbol === 'BTC';
    const bitcoinAddress = bitcoinSigner?.({ changeIndex: 0, addressIndex: 0 }).address ?? '';
    const stacksAddress = stacksAccount?.address ?? '';
    void setFieldValue('recipient', isBitcoin ? bitcoinAddress : stacksAddress, false);
    onClose();
  }

  return (
    <AccountListItemLayout
      fingerprint={accountId.fingerprint}
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
      walletType={walletType}
    />
  );
});
