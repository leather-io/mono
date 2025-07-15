import { RefObject, useRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import WebView, { WebViewNavigation } from 'react-native-webview';

import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

import { BrowserNavigationBar } from './browser-navigation-bar';
import { SearchBarToolbar } from './search-bar-toolbar';
import { BrowserSearchInput } from './search-input/browser-search-input';
import { useSearchBarAnimatedStyles } from './use-search-bar-animated-styles';

interface SearchBarProps {
  webViewRef: RefObject<WebView | null>;
  textUrl: string;
  setTextUrl(url: string): void;
  searchUrl: string;
  onSubmit(): void;
  navState: WebViewNavigation | null;
  setBrowserNavigationBarHeight(height: number): void;
}

const AnimatedBox = Animated.createAnimatedComponent(Box);

export function SearchBar({
  webViewRef,
  textUrl,
  setTextUrl,
  searchUrl,
  navState,
  onSubmit,
  setBrowserNavigationBarHeight,
}: SearchBarProps) {
  const theme = useTheme<Theme>();
  const textInputRef = useRef<RNTextInput>(null);

  const { keyboardAvoidingStyle, searchBarStyle } = useSearchBarAnimatedStyles();

  function goBack() {
    webViewRef.current?.goBack();
  }

  return (
    <>
      <AnimatedBox
        bottom={0}
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
          onPressUrl={() => textInputRef.current?.focus()}
          canGoBack={!!navState?.canGoBack}
        />
      </AnimatedBox>
      <AnimatedBox
        style={[
          keyboardAvoidingStyle,
          {
            paddingHorizontal: theme.spacing['5'],
            paddingTop: theme.spacing['1'],
            paddingBottom: theme.spacing['4'],
          },
          searchBarStyle,
        ]}
        borderTopLeftRadius="lg"
        borderTopRightRadius="lg"
        borderColor="ink.border-default"
        borderWidth={1}
        borderBottomWidth={0}
        borderStyle="solid"
        backgroundColor="ink.background-primary"
        position="absolute"
        right={0}
        left={0}
      >
        <BrowserSearchInput
          textInputRef={textInputRef}
          textUrl={textUrl}
          setTextUrl={setTextUrl}
          onSubmit={onSubmit}
        />
        <SearchBarToolbar
          onExplore={async () => {
            // TODO: implement functionality
          }}
          onRecents={async () => {
            // TODO: implement functionality
          }}
          onConnections={async () => {
            // TODO: implement functionality
          }}
        />
      </AnimatedBox>
    </>
  );
}
