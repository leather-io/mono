import { useEffect, useRef, useState } from 'react';
import { InteractionManager, Keyboard } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useToastContext } from '@/components/toast/toast-context';
import { BrowserLoadingMethods } from '@/features/account/components/browser-loading';
import { Browser } from '@/features/browser/browser/browser';
import { SearchBar } from '@/features/browser/browser/search-bar/search-bar';
import { useBrowserSearchState } from '@/features/browser/browser/use-browser-search-state';
import { isValidUrl } from '@/features/browser/browser/utils';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';
import { useLocalSearchParams } from 'expo-router';

import { Box } from '@leather.io/ui/native';

export default function BrowserScreen() {
  const { browserSearchState, goToUrl, setTextUrl } = useBrowserSearchState();
  const { url: urlQuery } = useLocalSearchParams<{ url?: string }>();
  useEffect(() => {
    if (urlQuery) {
      analytics.track('in_app_browser_opened', { url: urlQuery });
      goToUrl(urlQuery);
    }
  }, [urlQuery, goToUrl]);

  const webViewRef = useRef<WebView>(null);
  const [navState, setNavState] = useState<WebViewNavigation | null>(null);
  const browserLoadingRef = useRef<BrowserLoadingMethods>(null);

  const { displayToast } = useToastContext();

  return (
    <Box flex={1} bg="ink.background-primary">
      <Browser
        webViewRef={webViewRef}
        navState={navState}
        setNavState={setNavState}
        searchUrl={browserSearchState.searchUrl}
        goToUrl={goToUrl}
        browserLoadingRef={browserLoadingRef}
      />

      <SearchBar
        webViewRef={webViewRef}
        textUrl={browserSearchState.textUrl}
        searchUrl={browserSearchState.searchUrl}
        setTextUrl={setTextUrl}
        navState={navState}
        browserLoadingRef={browserLoadingRef}
        goToUrl={goToUrl}
        onSubmit={() => {
          Keyboard.dismiss();
          // setting timeout s.t. keyboard has time to close before opening url
          // Without this search bar gets lost sometimes after going to active browser tab
          setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
              if (isValidUrl(browserSearchState.textUrl)) {
                goToUrl(browserSearchState.textUrl);
              } else {
                displayToast({
                  type: 'error',
                  title: t`Wrong URL`,
                });
              }
            });
          }, 50);
        }}
      />
    </Box>
  );
}
