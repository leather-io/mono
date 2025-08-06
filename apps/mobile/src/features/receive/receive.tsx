import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { ReceiveFlowProvider } from '@/features/receive/receive-flow-provider';
import { useAccounts } from '@/store/accounts/accounts.read';

import { ReceiveNavigator, ReceiveStack } from './navigation';
import { AssetDetails } from './screens/asset-details';
import { SelectAccount } from './screens/select-account';
import { SelectAsset, SelectedAsset } from './screens/select-asset';

interface ReceiveProps {
  accountId?: string;
  asset?: string | undefined;
}

export function Receive({ accountId, asset }: ReceiveProps) {
  // - Pete accountId is working but need to get asset preselecting now via route params
  // this should probably not be a nested sheet though
  // maybe instead I can include this component in the sheet and then just pass in the asset
  // and accountId as props
  // that way I can just use the sheet navigation container and not have to nest it
  // ???
  console.log('------------ Receive asset', accountId, asset);
  const accounts = useAccounts();
  const selectedAccount = accounts.list.find(account => account.id === accountId);

  return (
    <ReceiveFlowProvider
      initialData={{
        accounts: accounts.list,
        selectedAccount,
        selectedAsset: asset as unknown as SelectedAsset,
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
