import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { AccountList } from '@/features/account/account-list/account-list';
import { useReceiveFlowContext } from '@/features/receive/receive-flow-provider';
import { NetworkBadge } from '@/features/settings/network-badge';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';

import { useReceiveNavigation } from '../navigation';

export function SelectAccount() {
  const navigation = useReceiveNavigation();
  const {
    selectAccount,
    state: { accounts },
  } = useReceiveFlowContext();

  function onSelectAccount(account: Account) {
    selectAccount(account);
    navigation.navigate('select-asset', { account, previousRoute: 'select-account' });
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
      <AccountList accounts={accounts} onPress={onSelectAccount} showWalletInfo />
    </FullHeightSheetLayout>
  );
}
