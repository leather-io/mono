import { useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletModal } from '@/components/add-wallet/add-wallet-modal';
import { ApproverModal } from '@/components/browser/approval-ux-modal';
import { BrowserMessage } from '@/components/browser/browser-in-use';
import { PressableListItem, TitleListItem } from '@/components/developer-console/list-items';
import { APP_ROUTES } from '@/constants';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';
import { router } from 'expo-router';

import { Box, Theme } from '@leather.io/ui/native';

export default function DeveloperConsoleScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const [getAddressesMessage, setGetAddressesMessage] = useState<BrowserMessage | null>(null);
  const addWalletModalRef = useRef<BottomSheetModal>(null);
  return (
    <Box flex={1} backgroundColor="base.ink.background-primary" style={{}}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['3'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Box gap="2">
          <TitleListItem title="Open dummy page" />
          <PressableListItem title="Drawer" />
          <PressableListItem title="Page" />
          <PressableListItem
            onPress={() => addWalletModalRef.current?.present()}
            title="Create wallet"
          />
          <PressableListItem
            title="Wallet management"
            onPress={() => router.navigate(APP_ROUTES.WalletDeveloperConsoleWalletManager)}
          />
        </Box>
        <Box gap="2">
          <TitleListItem title="Trigger API presets" />
          <PressableListItem
            title="getAddresses"
            onPress={() => {
              setGetAddressesMessage({
                jsonrpc: '2.0',
                id: 'string',
                method: 'getAddresses',
              });
            }}
          />
          <PressableListItem title="signMessage" />
          <PressableListItem title="transferBtc" />
          <PressableListItem title="signPsbt" />
          <PressableListItem title="stx_signTransaction" />
          <PressableListItem title="stx_signMessage" />
        </Box>
      </ScrollView>
      <ApproverModal
        message={getAddressesMessage}
        sendResult={() => setGetAddressesMessage(null)}
      />
      <AddWalletModal addWalletModalRef={addWalletModalRef} />
    </Box>
  );
}
