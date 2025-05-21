import { useRef, useState } from 'react';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useSettings } from '@/store/settings/settings';

import { Sheet } from '@leather.io/ui/native';

import { BrowserActiveState } from './browser-active-state';
import { BrowserInactiveState } from './browser-inactive-state';
import { SearchBar } from './search-bar/search-bar';
import { useBrowserSearchState } from './use-browser-search-state';

export function BrowserSheet() {
  const { browserSheetRef } = useGlobalSheets();
  const { browserSearchState, goToUrl, resetSearchBar, setTextUrl } = useBrowserSearchState();
  const [browserNavigationBarHeight, setBrowserNavigationBarHeight] = useState(0);

  const webViewRef = useRef<WebView>(null);
  const [navState, setNavState] = useState<WebViewNavigation | null>(null);

  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet
      ref={browserSheetRef}
      snapPointVariant="fullHeightWithoutNotch"
      shouldHaveContainer={false}
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
        onSubmit={() => goToUrl(browserSearchState.textUrl)}
      />
    </Sheet>
  );
}
