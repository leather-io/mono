import { useImperativeHandle, useRef, useState } from 'react';
import { InteractionManager, Keyboard } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useToastContext } from '@/components/toast/toast-context';
import { useBrowser } from '@/core/browser-provider';
import { Browser } from '@/features/browser/browser/browser';
import { SearchBar } from '@/features/browser/browser/search-bar/search-bar';
import { useBrowserSearchState } from '@/features/browser/browser/use-browser-search-state';
import { isValidUrl } from '@/features/browser/browser/utils';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Box } from '@leather.io/ui/native';

export default function BrowserScreen() {
  const { linkingRef } = useBrowser();
  const { browserSearchState, goToUrl, setTextUrl } = useBrowserSearchState();
  const [browserNavigationBarHeight, setBrowserNavigationBarHeight] = useState(0);
  const router = useRouter();

  const webViewRef = useRef<WebView>(null);
  const [navState, setNavState] = useState<WebViewNavigation | null>(null);

  useImperativeHandle(linkingRef, () => ({
    openURL(url) {
      router.dismissAll();
      router.replace('/browser', {});
      void analytics?.track('in_app_browser_opened', { url });
      goToUrl(url);
    },
  }));
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
