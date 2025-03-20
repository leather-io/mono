import { RefObject, useRef, useState } from 'react';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useSettings } from '@/store/settings/settings';

import { Sheet, SheetRef } from '@leather.io/ui/native';

import { BrowserActiveState } from './browser-active-state';
import { BrowserInactiveState } from './browser-inactive-state';
import { SearchBar } from './search-bar/search-bar';
import { useBrowserSearchState } from './use-browser-search-state';

interface BrowserSheetProps {
  sheetRef: RefObject<SheetRef>;
}

export function BrowserSheet({ sheetRef }: BrowserSheetProps) {
  const { browserSearchState, goToUrl, resetSearchBar, setTextUrl } = useBrowserSearchState();

  const webViewRef = useRef<WebView>(null);
  const [navState, setNavState] = useState<WebViewNavigation | null>(null);

  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet
      ref={sheetRef}
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
        />
      )}

      <SearchBar
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
