import { SheetNavigationContainer } from '@/core/sheet-navigation-container';

import { ReceiveNavigator, ReceiveStack } from './navigation';
import { AssetDetails } from './screens/asset-details';
import { SelectAccount } from './screens/select-account';
import { SelectAsset } from './screens/select-asset';

export function Receive() {
  return (
    <SheetNavigationContainer>
      <ReceiveNavigator>
        <ReceiveStack.Screen name="select-account" component={SelectAccount} />
        <ReceiveStack.Screen name="select-asset" component={SelectAsset} />
        <ReceiveStack.Screen name="asset-details" component={AssetDetails} />
      </ReceiveNavigator>
    </SheetNavigationContainer>
  );
}
