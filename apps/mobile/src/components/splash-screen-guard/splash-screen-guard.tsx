import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import LottieView from 'lottie-react-native';

import { colorThemes } from '@leather.io/tokens';
import { Box, Button, HasChildren, Theme, useOnMount } from '@leather.io/ui/native';

import { LeatherLockedSplash } from '../animations/leather-locked-splash';
import { LeatherSplash } from '../animations/leather-splash';
import { AuthContext } from './use-auth-context';
import { useAuthState } from './use-auth-state';

const DEFAULT_ANIMATION_FINISHED = false;

export function SplashScreenGuard({ children }: HasChildren) {
  const [animationFinished, setAnimationFinished] = useState(DEFAULT_ANIMATION_FINISHED);
  const splashRef = useRef<LottieView>(null);
  const lockedSplashRef = useRef<LottieView>(null);
  const { whenTheme } = useSettings();
  const insets = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const colorScheme = useColorScheme();
  // pre-load main queries
  void useTotalBalance();
  void useTotalActivity();

  const playSplash = useCallback(() => {
    splashRef.current?.play();
    lockedSplashRef.current?.play();
  }, []);

  const { tryAuthentication, authState, lockApp } = useAuthState({
    playSplash,
    setAnimationFinished,
  });

  useEffect(() => {
    // just in case splash screen flashes, we want to at least have the correct colors set
    void SystemUI.setBackgroundColorAsync(
      colorScheme === 'dark'
        ? theme.colors['ink.text-non-interactive']
        : theme.colors['ink.text-primary']
    );
    void SplashScreen.hideAsync();
  }, [colorScheme, theme.colors]);

  useOnMount(() => {
    // try authenticating when we first open the app
    void tryAuthentication({ firstTry: true });
  });

  async function onUnlock() {
    return tryAuthentication({ firstTry: false });
  }

  if (animationFinished) {
    return <AuthContext.Provider value={{ lockApp }}>{children}</AuthContext.Provider>;
  }

  const splash =
    authState === 'cold-start' || authState === 'started' || authState === 'passed-on-first' ? (
      <LeatherSplash
        ref={splashRef}
        onAnimationEnd={() => setAnimationFinished(true)}
        autoPlay={false}
      />
    ) : (
      <LeatherLockedSplash
        ref={lockedSplashRef}
        onAnimationEnd={() => setAnimationFinished(true)}
        autoPlay={false}
      />
    );

  return (
    <Box
      backgroundColor={whenTheme({
        light: 'ink.text-primary' as const,
        dark: 'ink.text-non-interactive' as const,
      })}
      flex={1}
    >
      {splash}
      {authState === 'failed' && (
        <Button
          onPress={onUnlock}
          style={{
            bottom: insets.bottom + theme.spacing[5],
            left: theme.spacing[5],
            right: theme.spacing[5],
            position: 'absolute',
            backgroundColor: colorThemes.dark['ink.action-primary-default'],
          }}
          textStyle={{
            color: colorThemes.dark['ink.background-primary'],
          }}
          title={t({
            id: 'unlock',
            message: 'Unlock',
          })}
          buttonState="default"
        />
      )}
    </Box>
  );
}
