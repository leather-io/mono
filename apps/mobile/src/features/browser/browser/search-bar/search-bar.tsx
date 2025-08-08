import { RefObject, useRef } from 'react';
import { Keyboard, TextInput as RNTextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import WebView, { WebViewNavigation } from 'react-native-webview';

import {
  BrowserLoading,
  BrowserLoadingMethods,
} from '@/features/account/components/browser-loading';
import { BottomGradient } from '@/features/navigation/bottom-gradient';
import { LEATHER_APPS_URL } from '@/shared/constants';
import { useRouter } from 'expo-router';

import { Box, useTheme } from '@leather.io/ui/native';

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
  browserLoadingRef: RefObject<BrowserLoadingMethods | null>;
  goToUrl(url: string): void;
}

const AnimatedBox = Animated.createAnimatedComponent(Box);

export function SearchBar({
  webViewRef,
  textUrl,
  setTextUrl,
  searchUrl,
  navState,
  onSubmit,
  browserLoadingRef,
  goToUrl,
}: SearchBarProps) {
  const theme = useTheme();
  const textInputRef = useRef<RNTextInput>(null);

  const router = useRouter();
  const { keyboardAvoidingStyle, searchBarStyle } = useSearchBarAnimatedStyles();

  function goBack() {
    webViewRef.current?.goBack();
  }

  return (
    <>
      <AnimatedBox
        bottom={0}
        position="relative"
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
      >
        <BrowserLoading ref={browserLoadingRef} />
        <BottomGradient />
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
          onExplore={() => {
            goToUrl(LEATHER_APPS_URL);
            Keyboard.dismiss();
          }}
          onRecents={() => {
            router.navigate('/app-recently-viewed');
          }}
          onConnections={() => {
            router.navigate('/app-connections');
          }}
        />
      </AnimatedBox>
    </>
  );
}
