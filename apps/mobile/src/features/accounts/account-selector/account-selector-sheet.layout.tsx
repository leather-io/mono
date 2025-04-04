import { RefObject, useRef } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Draggable } from '@/components/draggable';
import { HEADER_HEIGHT } from '@/shared/constants';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { useSettings } from '@/store/settings/settings';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, SheetRef, Theme } from '@leather.io/ui/native';

import { AccountAddress } from '../components/account-address';
import { AccountBalance } from '../components/account-balance';
import { AccountCard } from '../components/account-card';
import { AccountSelectorHeader } from './account-selector-sheet-header';

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
  const { top } = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const placeholderIdx = useSharedValue<null | number>(null);
  const direction = useSharedValue<'down' | 'up'>('down');
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();

  return (
    <Sheet
      shouldHaveContainer={false}
      ref={sheetRef}
      themeVariant={themeDerivedFromThemePreference}
      maxDynamicContentSize={Dimensions.get('screen').height - top - HEADER_HEIGHT}
    >
      <BottomSheetScrollView
        ref={scrollViewRef}
        style={{ backgroundColor: theme.colors['ink.background-primary'] }}
      >
        <Box px="5" pb="7">
          <AccountSelectorHeader sheetRef={sheetRef} />
          <Box gap="2">
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
                <WalletLoader fingerprint={account.fingerprint} key={account.id}>
                  {wallet => (
                    <AccountCard
                      testID={`${TestId.accountCard}-${idx}`}
                      caption={wallet.name}
                      primaryTitle={account.name}
                      secondaryTitle={
                        <AccountBalance
                          variant="label01"
                          accountIndex={account.accountIndex}
                          fingerprint={account.fingerprint}
                        />
                      }
                      address={
                        <AccountAddress
                          accountIndex={account.accountIndex}
                          fingerprint={account.fingerprint}
                        />
                      }
                      icon={account.icon}
                    />
                  )}
                </WalletLoader>
              </Draggable>
            ))}
          </Box>
        </Box>
      </BottomSheetScrollView>
    </Sheet>
  );
}
