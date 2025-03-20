import { RefObject, useRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { KeyboardController } from 'react-native-keyboard-controller';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

import { Box, Theme } from '@leather.io/ui/native';

import { BrowserType } from '../utils';
import { BrowserNavigationBar } from './browser-navigation-bar';
import { SearchBarToolbar } from './search-bar-toolbar';
import { SearchInput } from './search-input';
import { useSearchBarAnimatedStyles } from './use-search-bar-animated-styles';

interface SearchBarProps {
  webViewRef: RefObject<WebView>;
  textUrl: string;
  setTextUrl(url: string): void;
  searchUrl: string;
  onSubmit(): void;
  navState: WebViewNavigation | null;
  browserType: BrowserType;
  resetBrowser(): void;
}

const AnimatedBox = Animated.createAnimatedComponent(Box);

export function SearchBar({
  webViewRef,
  textUrl,
  setTextUrl,
  searchUrl,
  browserType,
  navState,
  onSubmit,
  resetBrowser,
}: SearchBarProps) {
  const theme = useTheme<Theme>();
  const { bottom } = useSafeAreaInsets();
  const textInputRef = useRef<RNTextInput>(null);

  const { keyboardAvoidingStyle, searchBarStyle, isUrlFocused, browserNavigationBarStyle } =
    useSearchBarAnimatedStyles();

  function goBack() {
    webViewRef.current?.goBack();
  }

  function goForward() {
    webViewRef.current?.goForward();
  }

  function refresh() {
    webViewRef.current?.reload();
  }

  return (
    <>
      {browserType === 'active' && (
        <AnimatedBox
          style={[keyboardAvoidingStyle, browserNavigationBarStyle]}
          pt="4"
          position="absolute"
          right={0}
          left={0}
        >
          <BrowserNavigationBar
            searchUrl={searchUrl}
            onGoBack={goBack}
            onGoForward={goForward}
            onPressUrl={() => textInputRef.current?.focus()}
            canGoBack={!!navState?.canGoBack}
            canGoForward={!!navState?.canGoForward}
          />
        </AnimatedBox>
      )}
      <AnimatedBox
        style={[
          keyboardAvoidingStyle,
          browserType === 'active' ? searchBarStyle : null,
          {
            paddingHorizontal: theme.spacing['5'],
            paddingTop: theme.spacing['4'],
            paddingBottom: theme.spacing['4'] + bottom,
          },
        ]}
        borderTopRightRadius="lg"
        borderTopLeftRadius="lg"
        backgroundColor="ink.background-primary"
        position="absolute"
        right={0}
        left={0}
      >
        {browserType === 'active' && (
          <SearchBarToolbar
            onClickApps={() => {
              resetBrowser();
              KeyboardController.dismiss();
            }}
            onRefresh={() => {
              refresh();
              KeyboardController.dismiss();
            }}
            onPaste={async () => {
              const copiedString = await Clipboard.getStringAsync();
              setTextUrl(copiedString);
            }}
            onShare={async () => {
              if (navState?.url) await Sharing.shareAsync(navState?.url);
              KeyboardController.dismiss();
            }}
          />
        )}

        <SearchInput
          textInputRef={textInputRef}
          isUrlFocused={isUrlFocused}
          textUrl={textUrl}
          setTextUrl={setTextUrl}
          onSubmit={onSubmit}
        />
      </AnimatedBox>
    </>
  );
}
