import { RefObject, useEffect, useRef, useState } from 'react';
import ViewShot from 'react-native-view-shot';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import {
  BrowserLoading,
  BrowserLoadingMethods,
} from '@/features/account/components/browser-loading';
import { getFaviconAndSave } from '@/filesystem/favicon';
import { userAddsApp } from '@/store/apps/apps.write';
import { useAppDispatch } from '@/store/utils';
import { useTheme } from '@shopify/restyle';

import injectedProvider from '@leather.io/provider/mobile';
import { RpcResponses, getInfo, parseEndpointRequest, supportedMethods } from '@leather.io/rpc';
import { Box, Theme } from '@leather.io/ui/native';

import { ApproverSheet } from '../approver-sheet/approver-sheet';
import { BrowserMessage } from '../approver-sheet/utils';
import { captureScreenshot, createGetInfoResponse, createSupportedMethodsResponse } from './utils';

const CONTENT_OFFSET_FOR_BROWSER_CLOSE = 150;

interface BrowserActiveStateProps {
  webViewRef: RefObject<WebView | null>;
  searchUrl: string;
  navState: WebViewNavigation | null;
  setNavState: (navState: WebViewNavigation | null) => void;
  goToUrl(url: string): void;
  browserNavigationBarHeight: number;
}

export function BrowserActiveState({
  webViewRef,
  searchUrl,
  navState,
  setNavState,
  goToUrl,
  browserNavigationBarHeight,
}: BrowserActiveStateProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const theme = useTheme<Theme>();
  const [message, setMessage] = useState<BrowserMessage>(null);

  const browserLoadingRef = useRef<BrowserLoadingMethods>(null);
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
  function postMessage(result: string) {
    webViewRef.current?.injectJavaScript(`window.onMessageFromRN(${result});`);
  }

  function sendResult(result: RpcResponses) {
    postMessage(JSON.stringify(result));
    setMessage(null);
  }

  function onMessageHandler(event: WebViewMessageEvent) {
    const newMessage = JSON.parse(event.nativeEvent.data);
    const parsedMessage = parseEndpointRequest(newMessage);

    if (!parsedMessage) return;

    const getInfoMessage = getInfo.request.safeParse(parsedMessage);
    if (getInfoMessage.success) {
      return sendResult(createGetInfoResponse(getInfoMessage.data));
    }

    const supportedMethodsMessage = supportedMethods.request.safeParse(parsedMessage);
    if (supportedMethodsMessage.success) {
      return sendResult(createSupportedMethodsResponse(supportedMethodsMessage.data));
    }

    return setMessage(parsedMessage);
  }

  return (
    <Box flex={1} bg="ink.background-primary">
      <BrowserLoading ref={browserLoadingRef} />
      <ViewShot
        ref={viewShotRef}
        style={{ flex: 1, paddingBottom: browserNavigationBarHeight - theme.spacing['2'] }}
      >
        <WebView
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y < -CONTENT_OFFSET_FOR_BROWSER_CLOSE) {
              browserSheetRef.current?.close();
            }
          }}
          onOpenWindow={e => {
            goToUrl(e.nativeEvent.targetUrl);
          }}
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
      {origin && <ApproverSheet request={message} origin={origin} sendResult={sendResult} />}
    </Box>
  );
}
