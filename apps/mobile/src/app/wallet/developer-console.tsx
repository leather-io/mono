import { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_HEIGHT } from '@/components/blurred-header';
import { ApproverModal } from '@/components/browser/approval-ux-modal';
import { BrowserMessage } from '@/components/browser/browser-in-use';
import { PressableListItem, TitleListItem } from '@/components/developer-console/list-items';
import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

export default function DeveloperConsoleScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const contentOffsetTop = top + HEADER_HEIGHT;
  const [getAddressesMessage, setGetAddressesMessage] = useState<BrowserMessage | null>(null);
  return (
    <Box
      flex={1}
      backgroundColor="base.ink.background-primary"
      style={{ paddingTop: contentOffsetTop }}
    >
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
        sendResult={() => {
          setGetAddressesMessage(null);
        }}
      />
    </Box>
  );
}
