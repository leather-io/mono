import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/components/network-badge';
import { AccountList } from '@/features/account-list/account-list';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { t } from '@lingui/macro';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { SendSheetNavigatorParamList } from '../send-sheet-navigator';

export function SelectAccountSheet() {
  const navigation = useNavigation<NavigationProp<SendSheetNavigatorParamList>>();
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
      <AccountList accounts={accounts.list} onPress={onSelectAccount} showWalletInfo />
    </FullHeightSheetLayout>
  );
}
