import { useRef } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Draggable } from '@/components/draggable';
import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { AccountBalance } from '@/features/balances/total-balance';
import { HEADER_HEIGHT } from '@/shared/constants';
import { Account } from '@/store/accounts/accounts';
import { getConnectedAppsToAccountIdMap, useApps } from '@/store/apps/apps.read';
import { useSettings } from '@/store/settings/settings';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { defaultIconTestId } from '@/utils/testing-utils';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { Box, Sheet, SheetRef, useTheme } from '@leather.io/ui/native';

import { AccountAddress } from '../components/account-address';
import { AccountCard } from '../components/account-card';
import { PortfolioHeader } from '../components/portfolio-header';

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
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const placeholderIdx = useSharedValue<null | number>(null);
  const direction = useSharedValue<'down' | 'up'>('down');
  const { list: connectedApps } = useApps('connected');
  const connectedAppsToAccountIdMap = getConnectedAppsToAccountIdMap(connectedApps);
  const { currentAccount } = useSettings();

  return (
    <FullHeightSheet
      sheetRef={sheetRef}
      maxDynamicContentSize={Dimensions.get('screen').height - top - HEADER_HEIGHT}
    >
      <Box
        bg="ink.background-primary"
        px="5"
        pb="5"
        style={{ paddingTop: top + theme.spacing['5'] }}
      >
        <PortfolioHeader />
      </Box>
      <Sheet.ScrollView ref={scrollViewRef}>
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
                      isSelected={
                        !!currentAccount &&
                        account.id ===
                          makeAccountIdentifer(
                            currentAccount?.fingerprint,
                            currentAccount?.accountIndex
                          )
                      }
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
    </FullHeightSheet>
  );
}
