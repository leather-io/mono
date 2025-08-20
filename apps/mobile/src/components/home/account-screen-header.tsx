import { Screen } from '@/components/screen/screen';
import { HeaderActions } from '@/components/screen/screen-header/components/header-actions';
import { AccountHeader } from '@/features/account/components/account-header';
import { Account } from '@/store/accounts/accounts';

import { Box } from '@leather.io/ui/native';

interface AccountScreenHeaderProps {
  account: Account;
  onOpenAccountSelector(): void;
}

export function AccountScreenHeader({ account, onOpenAccountSelector }: AccountScreenHeaderProps) {
  return (
    <Screen.Header
      leftElement={
        <Box p="2">
          <AccountHeader account={account} onPress={onOpenAccountSelector} />
        </Box>
      }
      rightElement={<HeaderActions />}
    />
  );
}
