import { FullHeightSheetHeader } from '@/components/headers/full-height-sheet-header';
import { NetworkBadge } from '@/components/network-badge';
import { AccountList } from '@/features/account-list/account-list';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { t } from '@lingui/macro';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { SendSheetNavigatorParamList } from '../send-sheet-navigator';
import { SendSheetLayout } from '../send-sheet.layout';

export function SelectAccount() {
  const navigation = useNavigation<NavigationProp<SendSheetNavigatorParamList>>();
  const accounts = useAccounts();

  function onSelectAccount(account: Account) {
    navigation.navigate('send-select-asset', { account });
  }

  return (
    <SendSheetLayout
      header={<FullHeightSheetHeader title={t`Select account`} rightElement={<NetworkBadge />} />}
    >
      <AccountList accounts={accounts.list} onPress={onSelectAccount} showWalletInfo />
    </SendSheetLayout>
  );
}
