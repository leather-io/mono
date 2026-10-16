import { useAccounts } from '@/store/accounts/accounts.read';

import { type AccountId } from '@leather.io/models';
import { type SheetRef } from '@leather.io/ui/native';

import { AccountSelectorSheetLayout } from './account-selector-sheet.layout';

interface AccountSelectedSheetProps {
  sheetRef: SheetRef;
  onAccountPress(account: AccountId): void;
}

export function AccountSelectorSheet({ sheetRef, onAccountPress }: AccountSelectedSheetProps) {
  const accounts = useAccounts().list;

  return (
    <AccountSelectorSheetLayout
      accounts={accounts.filter(account => account.status !== 'hidden')}
      onAccountPress={onAccountPress}
      sheetRef={sheetRef}
    />
  );
}
