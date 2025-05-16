import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { AccountList } from '@/features/account/account-list/account-list';
import { NetworkBadge } from '@/features/settings/network-badge';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { t } from '@lingui/macro';

import { CreateCurrentReceiveRoute, useReceiveSheetNavigation } from '../utils';

type CurrentRoute = CreateCurrentReceiveRoute<'select-account'>;

export function SelectAccount() {
  const navigation = useReceiveSheetNavigation<CurrentRoute>();
  const accounts = useAccounts();

  function onSelectAccount(account: Account) {
    navigation.navigate('select-asset', { account });
  }

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'select_account.header_title',
            message: 'Select account',
          })}
          subtitle={t({
            id: 'select_account.receive.header_subtitle',
            message: 'Receive',
          })}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <AccountList accounts={accounts.list} onPress={onSelectAccount} showWalletInfo />
    </FullHeightSheetLayout>
  );
}
