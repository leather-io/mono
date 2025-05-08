import { RefObject, useEffect, useRef, useState } from 'react';
import ViewShot from 'react-native-view-shot';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import {
  BrowserLoading,
  BrowserLoadingMethods,
} from '@/features/accounts/components/browser-loading';
import { getFaviconAndSave } from '@/filesystem/favicon';
import { userAddsApp } from '@/store/apps/apps.write';
import { useAppDispatch } from '@/store/utils';
import { useTheme } from '@shopify/restyle';

import injectedProvider from '@leather.io/provider/mobile';
import { Box, Theme } from '@leather.io/ui/native';

import { ApproverSheet } from '../approver-sheet/approver-sheet';
import { BrowserMessage } from '../approver-sheet/utils';
import { captureScreenshot, messagePartialZodObject } from './utils';

interface BrowserActiveStateProps {
  webViewRef: RefObject<WebView>;
  searchUrl: string;
  navState: WebViewNavigation | null;
  setNavState: (navState: WebViewNavigation | null) => void;
  goToUrl(url: string): void;
}

export function BrowserActiveState({
  webViewRef,
  searchUrl,
  navState,
  setNavState,
  goToUrl,
}: BrowserActiveStateProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const theme = useTheme<Theme>();
  const [message, setMessage] = useState<BrowserMessage>(null);

  const browserLoadingRef = useRef<BrowserLoadingMethods>(null);
  useEffect(() => {
    if (navState?.loading) {
      browserLoadingRef.current?.activate();
    } else {
      browserLoadingRef.current?.deactivate();
    }
    if (navState) {
      setOrigin(new URL(navState.url).origin);
    } else {
      setOrigin(null);
    }
  }, [navState, setOrigin]);

  async function handleWebViewNavigationStateChange(newNavState: WebViewNavigation) {
    setNavState(newNavState);
    const url = new URL(newNavState.url);
    goToUrl(newNavState.url);
    if (newNavState.loading) return;

    const uri = await getFaviconAndSave(url.hostname);
    const screenshotUri = await captureScreenshot(viewShotRef, url.hostname);
    if (uri) {
      dispatch(
        userAddsApp({
          icon: uri,
          screenshot: screenshotUri ?? null,
          name: newNavState.title,
          origin: url.origin,
          status: 'recently_visited',
        })
      );
    }
  }

  function onMessageHandler(event: WebViewMessageEvent) {
    const newMessage = JSON.parse(event.nativeEvent.data);

    if (messagePartialZodObject.safeParse(newMessage).success) {
      setMessage(newMessage);
    }
  }

  function postMessage(result: string) {
    webViewRef.current?.injectJavaScript(`window.onMessageFromRN(${result});`);
  }

  return (
    <Box flex={1} bg="ink.background-primary">
      <BrowserLoading ref={browserLoadingRef} />
      <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
        <WebView
          nestedScrollEnabled
          onMessage={onMessageHandler}
          allowsInlineMediaPlayback={true}
          injectedJavaScript={injectedProvider({
            branch: 'branch',
            version: 'version',
            commitSha: 'sha',
          })}
          ref={webViewRef}
          style={{
            flex: 1,
            backgroundColor: theme.colors['ink.background-primary'],
          }}
          source={{ uri: searchUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
        />
      </ViewShot>

      {origin && (
        <ApproverSheet
          request={message}
          origin={origin}
          sendResult={result => {
            postMessage(JSON.stringify(result));
            setMessage(null);
          }}
        />
      )}
    </Box>
  );
}
