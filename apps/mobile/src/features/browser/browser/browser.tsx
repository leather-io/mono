import { RefObject, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { BrowserLoadingMethods } from '@/features/account/components/browser-loading';
import { userAddsApp } from '@/store/apps/apps.write';
import { useAppDispatch } from '@/store/utils';
import * as Linking from 'expo-linking';

import injectedProvider from '@leather.io/provider/mobile';
import { RpcResponses } from '@leather.io/rpc';
import { Box, useTheme } from '@leather.io/ui/native';

import { ApproverSheet } from '../approver-sheet/approver-sheet';
import { resolveBrowserRpcRequest } from './message-routing';
import { captureScreenshot, createGetInfoResponse, createSupportedMethodsResponse } from './utils';

const CONTENT_OFFSET_FOR_BROWSER_CLOSE = 150;

interface BrowserProps {
  webViewRef: RefObject<WebView | null>;
  searchUrl: string;
  navState: WebViewNavigation | null;
  setNavState(navState: WebViewNavigation | null): void;
  goToUrl(url: string): void;
  browserLoadingRef: RefObject<BrowserLoadingMethods | null>;
}

export function Browser({
  webViewRef,
  searchUrl,
  navState,
  setNavState,
  goToUrl,
  browserLoadingRef,
}: BrowserProps) {
  const { top } = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);
  const { approverSheetRef } = useGlobalSheets();
  const [origin, setOrigin] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { browserSheetRef } = useGlobalSheets();

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
  }, [navState, navState?.loading, setOrigin, browserLoadingRef]);

  async function handleWebViewNavigationStateChange(newNavState: WebViewNavigation) {
    setNavState(newNavState);
    const url = new URL(newNavState.url);
    if (!newNavState.loading && newNavState.url !== searchUrl) {
      goToUrl(newNavState.url);
    }
    if (newNavState.loading) return;

    const screenshotUri = await captureScreenshot(viewShotRef, url.hostname);
    dispatch(
      userAddsApp({
        screenshot: screenshotUri ?? null,
        name: newNavState.title,
        origin: url.origin,
        status: 'recently_visited',
      })
    );
  }
  function postMessage(result: string) {
    webViewRef.current?.injectJavaScript(`window.onMessageFromRN(${result});`);
  }

  function sendResult(result: RpcResponses) {
    postMessage(JSON.stringify(result));
    approverSheetRef.current?.dismiss();
  }

  function onShouldStartLoadWithRequest(event: any) {
    const { url } = event;

    // Allow normal web URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }

    // If URL contains browser_fallback_url, extract and open it with Linking
    if (url.includes(';S.browser_fallback_url=')) {
      const fallbackMatch = url.match(/S\.browser_fallback_url=([^;]+)/);
      if (fallbackMatch && fallbackMatch[1]) {
        const fallbackUrl = decodeURIComponent(fallbackMatch[1]);
        void Linking.openURL(fallbackUrl);
      }
      return false;
    }
    // Handle all other deep links normally
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      void Linking.openURL(url);

      return false;
    }

    return true;
  }

  function onMessageHandler(event: WebViewMessageEvent) {
    const action = resolveBrowserRpcRequest({
      data: event.nativeEvent.data,
      frameUrl: event.nativeEvent.url,
      topFrameOrigin: origin,
    });

    switch (action.type) {
      case 'get-info':
        return sendResult(createGetInfoResponse(action.request));
      case 'supported-methods':
        return sendResult(createSupportedMethodsResponse(action.request));
      case 'present':
        return approverSheetRef.current?.present(action.request, action.origin);
      default:
        return;
    }
  }

  return (
    <Box flex={1} bg="ink.background-primary">
      <ViewShot ref={viewShotRef} style={{ flex: 1, paddingTop: top }}>
        <WebView
          originWhitelist={['*']}
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y < -CONTENT_OFFSET_FOR_BROWSER_CLOSE) {
              browserSheetRef.current?.close();
            }
          }}
          pullToRefreshEnabled
          onOpenWindow={e => {
            goToUrl(e.nativeEvent.targetUrl);
          }}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          nestedScrollEnabled
          onMessage={onMessageHandler}
          allowsInlineMediaPlayback={true}
          injectedJavaScript={injectedProvider({
            // TODO: dApps should receive relevant data
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
      <ApproverSheet sendResult={sendResult} />
    </Box>
  );
}
