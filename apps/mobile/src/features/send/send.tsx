import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { SendNavigator, SendStack } from '@/features/send/navigation';
import { Approval } from '@/features/send/screens/approval';
import { Form } from '@/features/send/screens/form';
import { SelectAsset } from '@/features/send/screens/select-asset';
import { SendFlowProvider } from '@/features/send/send-flow-provider';
import { Account } from '@/store/accounts/accounts';

import { FungibleCryptoAsset } from '@leather.io/models';

interface SendProps {
  asset?: FungibleCryptoAsset;
  currentAccount: Account;
}

export function Send({ asset, currentAccount }: SendProps) {
  return (
    <SendFlowProvider
      initialData={{
        selectedAsset: asset,
        currentAccount,
      }}
    >
      <SheetNavigationContainer base="send">
        <SendNavigator>
          <SendStack.Screen name="select-asset" component={SelectAsset} />
          <SendStack.Screen name="form" component={Form} />
          <SendStack.Screen name="approval" component={Approval} />
        </SendNavigator>
      </SheetNavigationContainer>
    </SendFlowProvider>
  );
}
