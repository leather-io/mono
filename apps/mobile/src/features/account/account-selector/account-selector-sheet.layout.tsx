import { useRef } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Draggable } from '@/components/draggable';
import { AccountBalance } from '@/features/balances/total-balance';
import { HEADER_HEIGHT } from '@/shared/constants';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { getConnectedAppsToAccountIdMap, useApps } from '@/store/apps/apps.read';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/core/macro';
import { router } from 'expo-router';

import {
  Box,
  Pressable,
  SettingsGearIcon,
  Sheet,
  SheetRef,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

import { AccountAddress } from '../components/account-address';
import { AccountCard } from '../components/account-card';

interface AccountSelectorSheetLayoutProps {
  accounts: Account[];
  onAccountPress: (account: Account) => void;
  swapAccountIndexes: (from: number, to: number) => void;
  sheetRef: SheetRef;
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
  const { list: connectedApps } = useApps('connected');
  const connectedAppsToAccountIdMap = getConnectedAppsToAccountIdMap(connectedApps);

  return (
    <Sheet
      ref={sheetRef}
      maxDynamicContentSize={Dimensions.get('screen').height - top - HEADER_HEIGHT}
    >
      <Sheet.ScrollView ref={scrollViewRef} stickyHeaderIndices={[0]}>
        <Sheet.Header
          centerElement={<Sheet.Title>{t`All accounts`}</Sheet.Title>}
          rightElement={
            <Pressable
              hitSlop={12}
              onPress={() => {
                sheetRef.current?.close();
                router.navigate('/settings/wallet');
              }}
              testID={TestId.settingsWalletAndAccountsButton}
              pressEffects={legacyTouchablePressEffect}
            >
              <SettingsGearIcon />
            </Pressable>
          }
        />
        <Box px="5" pb="7">
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
                onCardPress={() => onAccountPress(account)}
                swapCardIndexes={swapAccountIndexes}
                // TODO: disable reorder for now before the release
                disableReorder
              >
                <WalletLoader fingerprint={account.fingerprint} key={account.id}>
                  {wallet => (
                    <AccountCard
                      caption={wallet.name}
                      primaryTitle={account.name}
                      appOrigins={connectedAppsToAccountIdMap[account.id]?.map(app => app.origin)}
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
                      iconTestID={defaultIconTestId(account.icon)}
                    />
                  )}
                </WalletLoader>
              </Draggable>
            ))}
          </Box>
        </Box>
      </Sheet.ScrollView>
    </Sheet>
  );
}
