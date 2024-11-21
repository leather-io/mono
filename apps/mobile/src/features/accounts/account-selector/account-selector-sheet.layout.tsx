import { RefObject, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { AvatarIcon } from '@/components/avatar-icon';
import { Draggable } from '@/components/draggable';
import { Account } from '@/store/accounts/accounts';
import { useSettings } from '@/store/settings/settings';
import { defaultIconTestId } from '@/utils/testing-utils';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, SheetRef, Theme } from '@leather.io/ui/native';

import { AccountAddress } from '../components/account-address';
import { AccountBalance } from '../components/account-balance';
import { AccountCard } from '../components/account-card';

interface AccountSelectorSheetLayoutProps {
  accounts: Account[];
  onAccountPress: (accountId: string) => void;
  swapAccountIndexes: (from: number, to: number) => void;
  sheetRef: RefObject<SheetRef>;
}

export function AccountSelectorSheetLayout({
  accounts,
  onAccountPress,
  swapAccountIndexes,
  sheetRef,
}: AccountSelectorSheetLayoutProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const placeholderIdx = useSharedValue<null | number>(null);
  const direction = useSharedValue<'down' | 'up'>('down');
  const theme = useTheme<Theme>();
  const { themeDerivedFromThemePreference } = useSettings();

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
            onCardPress={() => onAccountPress(account.id)}
            swapCardIndexes={swapAccountIndexes}
          >
            <AccountCard
              address={
                <AccountAddress
                  accountIndex={account.accountIndex}
                  fingerprint={account.fingerprint}
                />
              }
              balance={
                <AccountBalance
                  accountIndex={account.accountIndex}
                  fingerprint={account.fingerprint}
                />
              }
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
