import { Screen } from '@/components/screen/screen';
import { HeaderActions } from '@/components/screen/screen-header/components/header-actions';
import { AccountHeader } from '@/features/account/components/account-header';

import { AccountId } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

interface AccountScreenHeaderProps {
  account: AccountId;
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
