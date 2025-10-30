import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { ReceiveFlowProvider } from '@/features/receive/receive-flow-provider';
import { type ReceiveType } from '@/features/receive/utils/get-receive-type';

import { AccountId } from '@leather.io/models';

import { ReceiveNavigator, ReceiveStack } from './navigation';
import { AssetDetails } from './screens/asset-details';
import { SelectAsset, SelectedAsset } from './screens/select-asset';

interface ReceiveProps {
  selectedAsset?: SelectedAsset;
  currentAccount: AccountId;
  receiveType: ReceiveType;
}

export function Receive({ currentAccount, receiveType, selectedAsset }: ReceiveProps) {
  return (
    <ReceiveFlowProvider initialData={{ currentAccount, receiveType, selectedAsset }}>
      <SheetNavigationContainer base="receive">
        <ReceiveNavigator>
          <ReceiveStack.Screen name="select-asset" component={SelectAsset} />
          <ReceiveStack.Screen name="asset-details" component={AssetDetails} />
        </ReceiveNavigator>
      </SheetNavigationContainer>
    </ReceiveFlowProvider>
  );
}
