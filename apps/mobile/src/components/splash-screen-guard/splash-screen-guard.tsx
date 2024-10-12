import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/hooks/app-state';
import { useSettings } from '@/store/settings/settings';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as LocalAuthentication from 'expo-local-authentication';
import LottieView from 'lottie-react-native';

import { Box, Button, Theme } from '@leather.io/ui/native';

import { LeatherLockedSplash } from '../animations/leather-locked-splash';
import { LeatherSplash } from '../animations/leather-splash';

const DEFAULT_ANIMATION_FINISHED = false; // __DEV__;

type AuthState = 'started' | 'failed' | 'passedOnFirst' | 'passedAfterwards';

export function SplashScreenGuard({ children }: HasChildren) {
  const [animationFinished, setAnimationFinished] = useState(DEFAULT_ANIMATION_FINISHED);
  const splashRef = useRef<LottieView>(null);
  const lockedSplashRef = useRef<LottieView>(null);
  const { appSecurityLevelPreference, whenTheme } = useSettings();
  const [authState, setAuthState] = useState<AuthState>('started');
  const insets = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  const tryAuthentication = useCallback(
    async ({ firstTry }: { firstTry: boolean }) => {
      if (appSecurityLevelPreference !== 'secure') {
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
    [appSecurityLevelPreference]
  );

  const onAppForeground = useCallback(() => {
    return tryAuthentication({ firstTry: true });
  }, [tryAuthentication]);

  const onAppBackground = useCallback(() => {
    setAnimationFinished(false);
    setAuthState('started');
  }, []);

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
    authState === 'started' || authState === 'passedOnFirst' ? (
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
          }}
          title={t`Unlock`}
          buttonState="success"
        />
      )}
    </Box>
  );
}
