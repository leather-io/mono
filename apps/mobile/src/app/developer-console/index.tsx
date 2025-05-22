import { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableListItem } from '@/components/developer-console/list-items';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { ApproverSheet } from '@/features/browser/approver-sheet/approver-sheet';
import { BrowserMessage } from '@/features/browser/approver-sheet/utils';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { router } from 'expo-router';

import { Box, Theme } from '@leather.io/ui/native';

const LEATHER_URL = 'https://leather.io';

export default function DeveloperConsoleScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  const [getAddressesMessage, setGetAddressesMessage] = useState<BrowserMessage | null>(null);
  const { addWalletSheetRef } = useGlobalSheets();

  const settings = useSettings();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['3'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[2],
        }}
      >
        <PressableListItem
          title={t`securityLevelPreference:` + ' ' + settings.securityLevelPreference}
        />
        <PressableListItem
          onPress={() => addWalletSheetRef.current?.present()}
          title={t`Create wallet`}
        />
        <PressableListItem
          title={t`Wallet management`}
          onPress={() => router.navigate(AppRoutes.DeveloperConsoleWalletManager)}
          testID={TestId.developerToolsWalletManagementButton}
        />
        <PressableListItem
          title={t`Bitcoin Scrach Pad`}
          onPress={() => router.navigate(AppRoutes.DeveloperBitcoinScratchPad)}
        />
        <PressableListItem
          title={t`getAddresses`}
          onPress={() =>
            setGetAddressesMessage({
              jsonrpc: '2.0',
              id: 'string',
              method: 'getAddresses',
            })
          }
        />
        <PressableListItem title={t`signMessage`} />
        <PressableListItem title={t`transferBtc`} />
        <PressableListItem title={t`signPsbt`} />
        <PressableListItem title={t`stx_signTransaction`} />
        <PressableListItem title={t`stx_signMessage`} />
        <PressableListItem title={t`Drawer`} />
        <PressableListItem title={t`Page`} />
      </ScrollView>
      <ApproverSheet
        origin={LEATHER_URL}
        request={getAddressesMessage}
        sendResult={() => setGetAddressesMessage(null)}
      />
    </Box>
  );
}
