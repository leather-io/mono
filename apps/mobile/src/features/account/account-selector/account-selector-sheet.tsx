import { RefObject, useCallback, useMemo } from 'react';

import { useAccounts } from '@/store/accounts/accounts.read';
import { userUpdatesAccountOrder } from '@/store/accounts/accounts.write';
import { useAppDispatch } from '@/store/utils';

import { SheetRef } from '@leather.io/ui/native';

import { AccountSelectorSheetLayout } from './account-selector-sheet.layout';

interface AccountSelectedSheetProps {
  sheetRef: RefObject<SheetRef>;
  onAccountPress: (accountId: string) => void;
}

export function AccountSelectorSheet({ sheetRef, onAccountPress }: AccountSelectedSheetProps) {
  const accounts = useAccounts().list;
  const dispatch = useAppDispatch();
  const checkIdxWithinBounds = useCallback(
    (id: number) => {
      return id >= 0 && id < accounts.length;
    },
    [accounts.length]
  );

  const accountIds = useMemo(() => accounts.map(acc => acc.id), [accounts]);
  const swapAccountIndexes = useCallback(
    (idx1: number | null, idx2: number | null) => {
      if (
        idx1 === null ||
        idx2 === null ||
        !checkIdxWithinBounds(idx1) ||
        !checkIdxWithinBounds(idx2) ||
        !accountIds[idx1] ||
        !accountIds[idx2]
      )
        return;
      const temp = accountIds[idx1];
      accountIds[idx1] = accountIds[idx2];
      accountIds[idx2] = temp;
      dispatch(userUpdatesAccountOrder({ accountIds }));
    },
    [accountIds, checkIdxWithinBounds, dispatch]
  );

  return (
    <AccountSelectorSheetLayout
      accounts={accounts.filter(account => account.status !== 'hidden')}
      onAccountPress={onAccountPress}
      swapAccountIndexes={swapAccountIndexes}
      sheetRef={sheetRef}
    />
  );
}
