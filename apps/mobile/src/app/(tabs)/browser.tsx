import { useEffect, useRef, useState } from 'react';
import { InteractionManager, Keyboard } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useToastContext } from '@/components/toast/toast-context';
import { Browser } from '@/features/browser/browser/browser';
import { SearchBar } from '@/features/browser/browser/search-bar/search-bar';
import { useBrowserSearchState } from '@/features/browser/browser/use-browser-search-state';
import { isValidUrl } from '@/features/browser/browser/utils';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';
import { useLocalSearchParams } from 'expo-router';

import { Box } from '@leather.io/ui/native';

export default function BrowserScreen() {
  const { browserSearchState, goToUrl, setTextUrl } = useBrowserSearchState();
  const [browserNavigationBarHeight, setBrowserNavigationBarHeight] = useState(0);
  const { url: urlQuery } = useLocalSearchParams<{ url?: string }>();
  useEffect(() => {
    if (urlQuery) {
      void analytics?.track('in_app_browser_opened', { url: urlQuery });
      goToUrl(urlQuery);
    }
  }, [urlQuery, goToUrl]);

  const webViewRef = useRef<WebView>(null);
  const [navState, setNavState] = useState<WebViewNavigation | null>(null);

  const { displayToast } = useToastContext();

  return (
    <Box flex={1} bg="ink.background-primary">
      <Browser
        webViewRef={webViewRef}
        navState={navState}
        setNavState={setNavState}
        searchUrl={browserSearchState.searchUrl}
        goToUrl={goToUrl}
        browserNavigationBarHeight={browserNavigationBarHeight}
      />

      <SearchBar
        setBrowserNavigationBarHeight={setBrowserNavigationBarHeight}
        webViewRef={webViewRef}
        textUrl={browserSearchState.textUrl}
        searchUrl={browserSearchState.searchUrl}
        setTextUrl={setTextUrl}
        navState={navState}
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
                  title: t({
                    id: 'browser.search-bar.wrong-url',
                    message: 'Wrong URL',
                  }),
                });
              }
            });
          }, 50);
        }}
      />
    </Box>
  );
}
