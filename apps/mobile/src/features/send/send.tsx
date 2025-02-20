import { SheetNavigationContainer } from '@/common/sheet-navigator/sheet-navigation-container';
import { SendNavigator, SendStack } from '@/features/send/navigation';
import { Approval } from '@/features/send/screens/approval';
import { Form } from '@/features/send/screens/form';
import { SelectAccount } from '@/features/send/screens/select-account';
import { SelectAsset } from '@/features/send/screens/select-asset';
import { SendFlowProvider } from '@/features/send/send-flow-provider';
import { SendableAsset } from '@/features/send/types';
import { getInitialRelevantAccounts } from '@/features/send/utils';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';

interface SendProps {
  account?: Account;
  asset?: SendableAsset;
}

export function Send({ account, asset }: SendProps) {
  const accounts = useAccounts();

  return (
    <SendFlowProvider
      initialData={{
        accounts: getInitialRelevantAccounts(accounts.list),
        selectedAccount: account,
        selectedAsset: asset,
      }}
    >
      <SheetNavigationContainer>
        <SendNavigator>
          <SendStack.Screen name="select-asset" component={SelectAsset} />
          <SendStack.Screen name="select-account" component={SelectAccount} />
          <SendStack.Screen name="form" component={Form} />
          <SendStack.Screen name="approval" component={Approval} />
        </SendNavigator>
      </SheetNavigationContainer>
    </SendFlowProvider>
  );
}
