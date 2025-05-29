import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { ReceiveFlowProvider } from '@/features/receive/receive-flow-provider';
import { useAccounts } from '@/store/accounts/accounts.read';

import { ReceiveNavigator, ReceiveStack } from './navigation';
import { AssetDetails } from './screens/asset-details';
import { SelectAccount } from './screens/select-account';
import { SelectAsset } from './screens/select-asset';

interface ReceiveProps {
  accountId?: string;
}

export function Receive({ accountId }: ReceiveProps) {
  const accounts = useAccounts();
  const selectedAccount = accounts.list.find(account => account.id === accountId);

  return (
    <ReceiveFlowProvider
      initialData={{
        accounts: accounts.list,
        selectedAccount,
      }}
    >
      <SheetNavigationContainer base="receive">
        <ReceiveNavigator>
          <ReceiveStack.Screen name="select-account" component={SelectAccount} />
          <ReceiveStack.Screen name="select-asset" component={SelectAsset} />
          <ReceiveStack.Screen name="asset-details" component={AssetDetails} />
        </ReceiveNavigator>
      </SheetNavigationContainer>
    </ReceiveFlowProvider>
  );
}
