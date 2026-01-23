import { memo } from 'react';
import { useSelector } from 'react-redux';

import { getSwitchAccountSheetAccountNameSelector } from '@tests/selectors/account.selectors';

import type { AccountId } from '@leather.io/models';

import { isMatchingAccountId } from '@shared/utils';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useSwitchAccount } from '@app/common/hooks/account/use-switch-account';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { useNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { selectCurrentAccount } from '@app/store/software-keys/software-key.selectors';
import { useLoading } from '@app/store/ui/ui.hooks';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface SwitchAccountListItemProps {
  accountId: AccountId;
  handleClose(): void;
}
export const SwitchAccountListItem = memo(function SwitchAccountListItem({
  accountId,
  handleClose,
}: SwitchAccountListItemProps) {
  const stacksAccount = useStacksAccount(accountId);
  // console.log({ ...accountId }, stacksAccount);
  const stxAddress = stacksAccount?.address ?? '';
  const bitcoinSigner = useNativeSegwitSigner(accountId);
  const btcAddress = bitcoinSigner?.({ changeIndex: 0, addressIndex: 0 }).address ?? '';
  const currentAccount = useSelector(selectCurrentAccount);

  const { isLoading, setIsLoading, setIsIdle } = useLoading(
    'SWITCH_ACCOUNTS' + stxAddress || btcAddress
  );
  const { handleSwitchAccount } = useSwitchAccount(handleClose);
  const { data: name = '', isFetching: isFetchingBnsName } = useAccountDisplayName({
    address: stxAddress,
    index: accountId.accountIndex,
  });

  function handleClick() {
    setIsLoading();
    handleSwitchAccount(accountId);
    setIsIdle();
  }

  const isSelected = isMatchingAccountId(currentAccount, accountId);

  return (
    <AccountListItemLayout
      {...accountId}
      accountAddresses={<AccountAddresses accountId={accountId} />}
      accountName={
        <AccountNameLayout
          data-testid={getSwitchAccountSheetAccountNameSelector(accountId.accountIndex)}
          isLoading={isFetchingBnsName}
        >
          {name}
        </AccountNameLayout>
      }
      avatar={
        <AccountAvatarItem
          index={accountId.accountIndex}
          publicKey={stacksAccount?.stxPublicKey || ''}
        />
      }
      balanceLabel={<AccountTotalBalance accountId={accountId} />}
      isLoading={isLoading}
      isSelected={isSelected}
      onSelectAccount={handleClick}
    />
  );
});
