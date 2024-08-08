import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import ArrowRotateClockwise from '@/assets/arrow-rotate-clockwise.svg';
import ChevronLeft from '@/assets/chevron-left.svg';
import ChevronRight from '@/assets/chevron-right.svg';
import Cross from '@/assets/cross-large.svg';
import DotGridHorizontal from '@/assets/dot-grid-horizontal.svg';
import { Modal } from '@/components/bottom-sheet-modal';
import injectedProvider from '@/scripts/dist/injected-provider';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { ApproverModal } from './approval-ux-modal';

interface BrowserInUseProp {
  textURL: string;
  goToInactiveBrowser: () => void;
}

interface BrowserMessageDetails {
  jsonrpc: string;
  id: string;
  method: 'getAddresses';
}
export type BrowserMessage = BrowserMessageDetails | null;

export function BrowerInUse({ textURL, goToInactiveBrowser }: BrowserInUseProp) {
  const { top, bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const webViewRef = useRef<WebView>(null);
  const [navState, setNavState] = useState<WebViewNavigation | null>(null);
  const settingsModalRef = useRef<BottomSheetModal>(null);
  function closeBrowser() {
    goToInactiveBrowser();
  }

  function goBack() {
    webViewRef.current?.goBack();
  }

  function goForward() {
    webViewRef.current?.goForward();
  }

  function reload() {
    webViewRef.current?.reload();
  }

  function openSettings() {
    settingsModalRef.current?.present();
  }

  function handleWebViewNavigationStateChange(newNavState: WebViewNavigation) {
    setNavState(newNavState);
  }

  const [message, setMessage] = useState<BrowserMessage>(null);

  function onMessageHandler(event: WebViewMessageEvent) {
    const newMessage = JSON.parse(event.nativeEvent.data);
    // TODO: zod check newMessage
    setMessage(newMessage);
  }

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <Box flexDirection="row">
        <TouchableOpacity
          onPress={closeBrowser}
          flex={1}
          p="5"
          justifyContent="center"
          alignItems="flex-start"
        >
          <Cross height={24} width={24} color={theme.colors['ink.text-primary']} />
        </TouchableOpacity>
        <Box flex={999} p="5" justifyContent="center" alignItems="center">
          <Text variant="label02" color="ink.text-primary" numberOfLines={1}>
            {navState?.title}
          </Text>
          <Text variant="label02" color="ink.text-subdued" numberOfLines={1}>
            {navState?.url}
          </Text>
        </Box>
        <Box flex={1} p="5" justifyContent="center" alignItems="flex-end">
          <Box height={40} width={40} borderRadius="round" bg="yellow.border" />
        </Box>
      </Box>
      <WebView
        onMessage={onMessageHandler}
        injectedJavaScript={injectedProvider}
        ref={webViewRef}
        style={{
          flex: 1,
        }}
        source={{ uri: textURL }}
        onNavigationStateChange={handleWebViewNavigationStateChange}
      />
      <Box
        style={{ paddingBottom: theme.spacing[3] + bottom, paddingTop: theme.spacing[3] }}
        px="5"
        flexDirection="row"
        bg="ink.background-primary"
        justifyContent="space-between"
      >
        <TouchableOpacity
          p="3"
          onPress={goBack}
          opacity={navState?.canGoBack ? 1 : 0.3}
          disabled={!navState?.canGoBack}
        >
          <ChevronLeft width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity
          p="3"
          onPress={goForward}
          opacity={navState?.canGoForward ? 1 : 0.3}
          disabled={!navState?.canGoForward}
        >
          <ChevronRight width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity p="3" onPress={reload}>
          <ArrowRotateClockwise width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity p="3" onPress={openSettings}>
          <DotGridHorizontal width={24} height={24} />
        </TouchableOpacity>
      </Box>
      <Modal ref={settingsModalRef}>
        <Box p="5" />
      </Modal>
      <ApproverModal
        sendResult={result => {
          webViewRef?.current?.postMessage(
            JSON.stringify({
              id: message?.id,
              result,
            })
          );
          setMessage(null);
        }}
        message={message}
      />
    </View>
  );
}
