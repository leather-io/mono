import { RefObject, useRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { KeyboardController } from 'react-native-keyboard-controller';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

import { Box, Pressable, Text, Theme, legacyTouchablePressEffect } from '@leather.io/ui/native';

import { BrowserType } from '../utils';
import { BrowserNavigationBar } from './browser-navigation-bar';
import { SearchBarToolbar } from './search-bar-toolbar';
import { ActiveBrowserSearchInput } from './search-input/active-browser-search-input';
import { InactiveBrowserSearchInput } from './search-input/inactive-browser-search-input';
import { useSearchBarAnimatedStyles } from './use-search-bar-animated-styles';

interface SearchBarProps {
  webViewRef: RefObject<WebView | null>;
  textUrl: string;
  setTextUrl(url: string): void;
  searchUrl: string;
  onSubmit(): void;
  navState: WebViewNavigation | null;
  browserType: BrowserType;
  resetBrowser(): void;
  setBrowserNavigationBarHeight(height: number): void;
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
  setBrowserNavigationBarHeight,
}: SearchBarProps) {
  const theme = useTheme<Theme>();
  const textInputRef = useRef<RNTextInput>(null);

  const { keyboardAvoidingStyle, searchBarStyle, isUrlFocused, browserNavigationBarStyle } =
    useSearchBarAnimatedStyles();
  const { bottom } = useSafeAreaInsets();

  function goBack() {
    webViewRef.current?.goBack();
  }

  function goForward() {
    webViewRef.current?.goForward();
  }

  function refresh() {
    webViewRef.current?.reload();
  }

  const SearchInput =
    browserType === 'active' ? ActiveBrowserSearchInput : InactiveBrowserSearchInput;

  return (
    <>
      {browserType === 'active' && (
        <AnimatedBox
          style={[keyboardAvoidingStyle, browserNavigationBarStyle]}
          position="absolute"
          right={0}
          left={0}
          shadowColor="ink.background-overlay"
          shadowOffset={{
            width: 0,
            height: 12,
          }}
          shadowRadius={24}
          shadowOpacity={0.08}
          elevation={1}
          onLayout={e => {
            setBrowserNavigationBarHeight(e.nativeEvent.layout.height);
          }}
        >
          <BrowserNavigationBar
            searchUrl={searchUrl}
            onGoBack={goBack}
            onGoForward={goForward}
            onPressUrl={() => textInputRef.current?.focus()}
            canGoBack={!!navState?.canGoBack}
            canGoForward={!!navState?.canGoForward}
            resetBrowser={resetBrowser}
          />
        </AnimatedBox>
      )}
      {browserType === 'inactive' && (
        <AnimatedBox
          style={[keyboardAvoidingStyle, browserNavigationBarStyle]}
          pt="4"
          position="absolute"
          right={0}
          left={0}
          shadowColor="ink.background-overlay"
          shadowOffset={{
            width: 0,
            height: 12,
          }}
          shadowRadius={24}
          shadowOpacity={0.08}
          elevation={1}
          onLayout={e => {
            setBrowserNavigationBarHeight(e.nativeEvent.layout.height);
          }}
        >
          <Box
            style={{
              paddingBottom: theme.spacing['2'] + bottom,
            }}
            px="5"
            pt="2"
            width="100%"
            justifyContent="center"
            alignItems="center"
            backgroundColor="ink.background-primary"
          >
            <Pressable
              p="4"
              onPress={() => textInputRef.current?.focus()}
              pressEffects={legacyTouchablePressEffect}
            >
              <Text variant="label03">
                {t({
                  id: 'browser.searchbar.search-url',
                  message: 'Search or type url',
                })}
              </Text>
            </Pressable>
          </Box>
        </AnimatedBox>
      )}
      <AnimatedBox
        style={[
          keyboardAvoidingStyle,
          {
            paddingHorizontal: theme.spacing['5'],
            paddingTop: theme.spacing['4'],
            paddingBottom: theme.spacing['4'],
          },
          searchBarStyle,
        ]}
        borderTopRightRadius="lg"
        borderTopLeftRadius="lg"
        backgroundColor="ink.background-primary"
        position="absolute"
        right={0}
        left={0}
      >
        <SearchInput
          textInputRef={textInputRef}
          isUrlFocused={isUrlFocused}
          textUrl={textUrl}
          setTextUrl={setTextUrl}
          onSubmit={onSubmit}
        />
        {browserType === 'active' && (
          <SearchBarToolbar
            onClickApps={async () => {
              resetBrowser();
              await KeyboardController.dismiss();
            }}
            onRefresh={async () => {
              refresh();
              await KeyboardController.dismiss();
            }}
            onPaste={async () => {
              const copiedString = await Clipboard.getStringAsync();
              setTextUrl(copiedString);
            }}
            onShare={async () => {
              if (navState?.url) await Sharing.shareAsync(navState?.url);
              await KeyboardController.dismiss();
            }}
          />
        )}
      </AnimatedBox>
    </>
  );
}
