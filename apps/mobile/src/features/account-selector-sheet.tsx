import { RefObject, useCallback, useMemo, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { AvatarIcon } from '@/components/avatar-icon';
import { Draggable } from '@/components/draggable';
import { AppRoutes } from '@/routes';
import { useAccounts } from '@/store/accounts/accounts.read';
import { userUpdatesAccountOrder } from '@/store/accounts/accounts.write';
import { useSettings } from '@/store/settings/settings';
import { destructAccountIdentifier, useAppDispatch } from '@/store/utils';
import { defaultIconTestId } from '@/utils/testing-utils';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, Sheet, SheetRef, Theme } from '@leather.io/ui/native';

import { AccountCard } from './settings/wallet-and-accounts/account-card';

export function AccountSelectorSheet({ sheetRef }: { sheetRef: RefObject<SheetRef> }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const placeholderIdx = useSharedValue<null | number>(null);
  const accounts = useAccounts().list;
  const direction = useSharedValue<'down' | 'up'>('down');
  const router = useRouter();
  const theme = useTheme<Theme>();
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
              icon={
                <AvatarIcon color={theme.colors['ink.background-primary']} icon={account.icon} />
              }
              name={account.name}
              iconTestID={defaultIconTestId(account.icon)}
            />
          </Draggable>
        ))}
      </Box>
    </Sheet>
  );
}
