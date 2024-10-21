import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/hooks/app-state';
import { useSettings } from '@/store/settings/settings';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import LottieView from 'lottie-react-native';

import { colorThemes } from '@leather.io/tokens';
import { Box, Button, Theme } from '@leather.io/ui/native';

import { LeatherLockedSplash } from '../animations/leather-locked-splash';
import { LeatherSplash } from '../animations/leather-splash';

const DEFAULT_ANIMATION_FINISHED = false;
const UNLOCK_TIMEOUT = 60 * 1000;
type AuthState = 'cold-start' | 'started' | 'failed' | 'passedOnFirst' | 'passedAfterwards';

export function SplashScreenGuard({ children }: HasChildren) {
  const [animationFinished, setAnimationFinished] = useState(DEFAULT_ANIMATION_FINISHED);
  const splashRef = useRef<LottieView>(null);
  const lockedSplashRef = useRef<LottieView>(null);
  const { securityLevelPreference, whenTheme, changeLastUnlocked, lastUnlocked } = useSettings();
  const [authState, setAuthState] = useState<AuthState>('cold-start');
  const insets = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // just in case splash screen flashes, we want to at least have the correct colors set
    void SystemUI.setBackgroundColorAsync(
      colorScheme === 'dark'
        ? theme.colors['ink.text-non-interactive']
        : theme.colors['ink.text-primary']
    );
    void SplashScreen.hideAsync();
  }, [colorScheme, theme.colors]);

  const checkUnlockTime = useCallback(() => {
    return !!lastUnlocked && lastUnlocked > +new Date() - UNLOCK_TIMEOUT;
  }, [lastUnlocked]);

  const tryAuthentication = useCallback(
    async ({ firstTry }: { firstTry: boolean }) => {
      // if in insecure mode - just proceed with a splash
      if (securityLevelPreference !== 'secure') {
        playSplash();
        return;
      }
      // if in secure mode, skip checks only if unlock time is not exceeding the timeout
      // and this is not a cold start of the app
      if (securityLevelPreference === 'secure' && authState !== 'cold-start' && checkUnlockTime()) {
        setAuthState('passedOnFirst');
        setAnimationFinished(true);
        playSplash();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync();
      if (result.success) {
        playSplash();
        if (firstTry) {
          setAuthState('passedOnFirst');
        } else {
          setAuthState('passedAfterwards');
        }
      } else {
        setAuthState('failed');
      }
    },
    [securityLevelPreference, checkUnlockTime, authState]
  );

  const onAppForeground = useCallback(() => {
    return tryAuthentication({ firstTry: true });
  }, [tryAuthentication]);

  const onAppBackground = useCallback(() => {
    if (securityLevelPreference === 'secure') {
      setAnimationFinished(false);
      setAuthState('started');
      changeLastUnlocked(+new Date());
    }
  }, [securityLevelPreference, changeLastUnlocked]);

  useAppState({
    onAppForeground,
    onAppBackground,
  });

  useEffect(() => {
    void tryAuthentication({ firstTry: true });
    // We need to run this only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function playSplash() {
    splashRef.current?.play();
    lockedSplashRef.current?.play();
  }

  async function onUnlock() {
    return tryAuthentication({ firstTry: false });
  }

  const splash =
    authState === 'cold-start' || authState === 'started' || authState === 'passedOnFirst' ? (
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

  if (animationFinished) {
    return children; // to their parents
  }

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
