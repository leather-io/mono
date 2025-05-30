import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { BackHandler, InteractionManager, Keyboard } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useToastContext } from '@/components/toast/toast-context';
import { useBrowser } from '@/core/browser-provider';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';

import { Sheet } from '@leather.io/ui/native';

import { BrowserActiveState } from './browser-active-state';
import { BrowserInactiveState } from './browser-inactive-state';
import { SearchBar } from './search-bar/search-bar';
import { useBrowserSearchState } from './use-browser-search-state';
import { isValidUrl } from './utils';

export function BrowserSheet() {
  const { browserSheetRef } = useGlobalSheets();
  const { linkingRef } = useBrowser();
  const { browserSearchState, goToUrl, resetSearchBar, setTextUrl } = useBrowserSearchState();
  const [browserNavigationBarHeight, setBrowserNavigationBarHeight] = useState(0);

  const webViewRef = useRef<WebView>(null);
  const [navState, setNavState] = useState<WebViewNavigation | null>(null);

  const { themeDerivedFromThemePreference } = useSettings();
  useImperativeHandle(linkingRef, () => ({
    openURL(url) {
      void analytics?.track('in_app_browser_opened', { url });
      browserSheetRef.current?.present();
      goToUrl(url);
    },
  }));
  const { displayToast } = useToastContext();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', function () {
      if (browserSearchState.browserType === 'active') {
        if (navState?.canGoBack) {
          webViewRef.current?.goBack();
        } else {
          resetSearchBar();
        }
        /**
         * When true is returned the event will not be bubbled up
         * & no other back action will execute
         */
        return true;
      }
      /**
       * Returning false will let the event to bubble up & let other event listeners
       * or the system's default back action to be executed.
       */
      return false;
    });

    return () => {
      subscription.remove();
    };
  }, [browserSearchState.browserType, navState?.canGoBack, resetSearchBar]);

  return (
    <Sheet
      ref={browserSheetRef}
      snapPointVariant="fullHeightWithoutNotch"
      shouldHaveContainer={true}
      themeVariant={themeDerivedFromThemePreference}
      onDismiss={resetSearchBar}
    >
      {browserSearchState.browserType === 'inactive' && <BrowserInactiveState goToUrl={goToUrl} />}
      {browserSearchState.browserType === 'active' && (
        <BrowserActiveState
          webViewRef={webViewRef}
          navState={navState}
          setNavState={setNavState}
          searchUrl={browserSearchState.searchUrl}
          goToUrl={goToUrl}
          browserNavigationBarHeight={browserNavigationBarHeight}
        />
      )}

      <SearchBar
        setBrowserNavigationBarHeight={setBrowserNavigationBarHeight}
        webViewRef={webViewRef}
        browserType={browserSearchState.browserType}
        textUrl={browserSearchState.textUrl}
        searchUrl={browserSearchState.searchUrl}
        setTextUrl={setTextUrl}
        navState={navState}
        resetBrowser={resetSearchBar}
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
    </Sheet>
  );
}
