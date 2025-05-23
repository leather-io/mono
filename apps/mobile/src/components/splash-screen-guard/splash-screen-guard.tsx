import { useCallback, useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/hooks/use-app-state';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

import { colorThemes } from '@leather.io/tokens';
import { Box, Button, HasChildren, Theme, useOnMount } from '@leather.io/ui/native';

import { LeatherSplash, SplashLottieView } from '../animations/leather-splash';
import { AuthContext } from './use-auth-context';
import { useAuthState } from './use-auth-state';

export function SplashScreenGuard({ children }: HasChildren) {
  const splashRef = useRef<SplashLottieView>(null);
  const lockedSplashRef = useRef<SplashLottieView>(null);
  const { whenTheme, securityLevelPreference } = useSettings();
  const insets = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const colorScheme = useColorScheme();

  const playSplash = useCallback(() => {
    splashRef.current?.start();
    lockedSplashRef.current?.start();
  }, []);
  const {
    authState,
    unlockOnOpen,
    unlockManually,
    unlockOnForeground,
    lockOnBackground,
    onFinishAnimation,
    lockManually,
    bypassSecurity,
  } = useAuthState({ playSplash });

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
    if (securityLevelPreference === 'secure') {
      void unlockOnOpen();
      return;
    } else {
      bypassSecurity();
      playSplash();
    }
  });

  function onUnlock() {
    if (securityLevelPreference === 'secure') {
      void unlockManually();
    } else {
      bypassSecurity();
      playSplash();
    }
  }

  const onAppForeground = useCallback(
    function () {
      if (securityLevelPreference === 'secure') {
        void unlockOnForeground();
        return;
      } else {
        bypassSecurity();
        playSplash();
      }
    },
    [bypassSecurity, playSplash, securityLevelPreference, unlockOnForeground]
  );

  const onAppBackground = useCallback(
    function () {
      if (securityLevelPreference === 'secure') {
        lockOnBackground();
      } else {
        bypassSecurity();
        playSplash();
      }
    },
    [bypassSecurity, lockOnBackground, securityLevelPreference, playSplash]
  );

  useAppState({
    onAppForeground,
    onAppBackground,
  });

  function lockApp() {
    lockManually();
  }

  const splash =
    authState.status === 'cold-start' ||
    authState.status === 'started' ||
    authState.status === 'passed-on-first' ? (
      <LeatherSplash splashRef={splashRef} type="unlocked" onAnimationFinish={onFinishAnimation} />
    ) : (
      <LeatherSplash
        splashRef={lockedSplashRef}
        type="locked"
        onAnimationFinish={onFinishAnimation}
      />
    );

  return (
    <AuthContext.Provider value={{ lockApp }}>
      {!authState.isUnlocked && (
        <Box
          backgroundColor={whenTheme({
            light: 'ink.text-primary' as const,
            dark: 'ink.text-non-interactive' as const,
          })}
          position="absolute"
          top={0}
          right={0}
          left={0}
          bottom={0}
          flex={1}
          zIndex="max"
        >
          {splash}
          {authState.status === 'failed' && (
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
      )}

      {children}
    </AuthContext.Provider>
  );
}
