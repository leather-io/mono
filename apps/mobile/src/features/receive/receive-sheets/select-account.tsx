import { ScrollView } from 'react-native-gesture-handler';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { AccountList } from '@/features/accounts/account-list/account-list';
import { NetworkBadge } from '@/features/settings/network-badge';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { t } from '@lingui/macro';

import { CreateCurrentReceiveRoute, useReceiveSheetNavigation } from '../utils';

type CurrentRoute = CreateCurrentReceiveRoute<'receive-select-account'>;

export function SelectAccount() {
  const navigation = useReceiveSheetNavigation<CurrentRoute>();
  const accounts = useAccounts();

  function onSelectAccount(account: Account) {
    navigation.navigate('receive-select-asset', { account });
  }

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'select_account.header_title',
            message: 'Select account',
          })}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <ScrollView>
        <AccountList accounts={accounts.list} onPress={onSelectAccount} showWalletInfo />
      </ScrollView>
    </FullHeightSheetLayout>
  );
}
