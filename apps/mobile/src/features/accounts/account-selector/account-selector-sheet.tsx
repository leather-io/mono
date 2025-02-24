import { RefObject, useCallback, useMemo } from 'react';

import { AppRoutes } from '@/routes';
import { useAccounts } from '@/store/accounts/accounts.read';
import { userUpdatesAccountOrder } from '@/store/accounts/accounts.write';
import { useAppDispatch } from '@/store/utils';
import { useRouter } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

import { AccountSelectorSheetLayout } from './account-selector-sheet.layout';

export function AccountSelectorSheet({ sheetRef }: { sheetRef: RefObject<SheetRef> }) {
  const accounts = useAccounts().list;
  const router = useRouter();
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
  const onAccountPress = useCallback(
    (accountId: string) => {
      sheetRef.current?.close();
      router.navigate({
        pathname: AppRoutes.Account,
        params: { accountId },
      });
    },
    [router, sheetRef]
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
