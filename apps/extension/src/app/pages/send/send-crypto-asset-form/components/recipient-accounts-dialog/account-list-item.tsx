import { memo } from 'react';
import { useFormContext } from 'react-hook-form';

import { AccountSelectors } from '@tests/selectors/account.selectors';

import type { AccountId } from '@leather.io/models';

import type { RecipientFormValues } from '@shared/models/form.model';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { getLedgerAccountIndicator } from '@app/components/account/ledger-account-indicator';
import { useNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { type WalletType } from '@app/store/common/wallet-type.selectors';
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
  const { getValues, setValue } = useFormContext<RecipientFormValues>();
  const stacksAccount = useStacksAccount(accountId);
  const bitcoinSigner = useNativeSegwitPayer(accountId);
  const { data: name } = useAccountDisplayName({
    address: stacksAccount?.address,
    index: accountId.accountIndex,
    fingerprint: accountId.fingerprint,
  });

  function onSelectAccount() {
    const isBitcoin = getValues('symbol') === 'BTC';
    const bitcoinAddress = bitcoinSigner?.({ changeIndex: 0, addressIndex: 0 }).address ?? '';
    const stacksAddress = stacksAccount?.address ?? '';
    setValue('recipient', isBitcoin ? bitcoinAddress : stacksAddress);
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
          indicator={getLedgerAccountIndicator(walletType, AccountSelectors.LedgerIndicator)}
        />
      }
      balanceLabel={<AccountTotalBalance accountId={accountId} />}
      isSelected={false}
      isLoading={false}
      onSelectAccount={onSelectAccount}
    />
  );
});
