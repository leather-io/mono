import { RefObject, useCallback, useMemo, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { getAvatarIcon } from '@/components/avatar-icon';
import { Draggable } from '@/components/draggable';
import { AccountCard } from '@/components/wallet-settings/account-card';
import { AppRoutes } from '@/routes';
import { useAccounts } from '@/store/accounts/accounts.read';
import { userUpdatesAccountOrder } from '@/store/accounts/accounts.write';
import { useSettings } from '@/store/settings/settings';
import { destructAccountIdentifier, useAppDispatch } from '@/store/utils';
import { defaultIconTestId } from '@/utils/testing-utils';
import { useRouter } from 'expo-router';

import { Box, Sheet, SheetRef } from '@leather.io/ui/native';

export function AccountSelectorSheet({ sheetRef }: { sheetRef: RefObject<SheetRef> }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const placeholderIdx = useSharedValue<null | number>(null);
  const accounts = useAccounts().list;
  const direction = useSharedValue<'down' | 'up'>('down');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { themeDerivedFromThemePreference } = useSettings();
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
      const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
      sheetRef.current?.close();
      router.navigate({
        pathname: AppRoutes.SettingsWalletConfigureAccount,
        params: { fingerprint, account: accountIndex },
      });
    },
    [router, sheetRef]
  );

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box p="5" gap="5">
        {accounts.map((account, idx) => (
          <Draggable
            idx={idx}
            direction={direction}
            scrollViewRef={scrollViewRef}
            placeholderIdx={placeholderIdx}
            cardsLength={accounts.length}
            key={account.id}
            cardId={account.id}
            onCardPress={onAccountPress}
            swapCardIndexes={swapAccountIndexes}
          >
            <AccountCard
              Icon={getAvatarIcon(account.icon)}
              name={account.name}
              iconTestID={defaultIconTestId(account.icon)}
            />
          </Draggable>
        ))}
      </Box>
    </Sheet>
  );
}
