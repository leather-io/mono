import { ScrollView } from 'react-native-gesture-handler';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { AccountList } from '@/features/accounts/account-list/account-list';
import { NetworkBadge } from '@/features/settings/network-badge';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { t } from '@lingui/macro';

import { CreateCurrentSendRoute, useSendSheetNavigation } from '../send-form.utils';

type CurrentRoute = CreateCurrentSendRoute<'send-select-account'>;

export function SelectAccountSheet() {
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const accounts = useAccounts();

  function onSelectAccount(account: Account) {
    navigation.navigate('send-select-asset', { account });
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
      <ScrollView scrollEnabled={accounts.list.length > 9}>
        <AccountList accounts={accounts.list} onPress={onSelectAccount} showWalletInfo />
      </ScrollView>
    </FullHeightSheetLayout>
  );
}
