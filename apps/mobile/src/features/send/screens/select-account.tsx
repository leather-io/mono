import { ScrollView } from 'react-native';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { AccountList } from '@/features/accounts/account-list/account-list';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TestId } from '@/shared/test-id';
import { type Account } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';

export function SelectAccount() {
  const { navigate } = useSendNavigation();
  const route = useSendRoute<'select-account'>();
  const canGoBack = route.params?.previousRoute === 'select-asset';

  const {
    state: { accounts, selectedAsset },
    selectAccount,
  } = useSendFlowContext();

  function handleSelectAccount(account: Account) {
    selectAccount(account);
    navigate(selectedAsset ? 'form' : 'select-asset', { previousRoute: 'select-account' });
  }

  function handleBackButtonPress() {
    navigate('select-asset');
    selectAccount(null);
  }

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'select_account.header_title',
            message: 'Select account',
          })}
          leftElement={canGoBack ? <HeaderBackButton onPress={handleBackButtonPress} /> : null}
          rightElement={<NetworkBadge />}
          testID={TestId.selectAccountHeader}
        />
      }
    >
      <ScrollView>
        <AccountList accounts={accounts} showWalletInfo onPress={handleSelectAccount} />
      </ScrollView>
    </FullHeightSheetLayout>
  );
}
