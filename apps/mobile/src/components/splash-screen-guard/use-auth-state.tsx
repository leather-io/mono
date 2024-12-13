import { useCallback, useState } from 'react';

import { useAppState } from '@/hooks/use-app-state';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import * as LocalAuthentication from 'expo-local-authentication';

const unlockTimeout = 60 * 1000;
type AuthState = 'cold-start' | 'started' | 'failed' | 'passed-on-first' | 'passed-afterwards';

export function useAuthState({
  playSplash,
  setAnimationFinished,
}: {
  playSplash(): void;
  setAnimationFinished(value: boolean): void;
}) {
  const { securityLevelPreference, userLeavesApp, lastActive } = useSettings();
  const [authState, setAuthState] = useState<AuthState>('cold-start');

  const checkUnlockTime = useCallback(() => {
    return !!lastActive && lastActive > +new Date() - unlockTimeout;
  }, [lastActive]);

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
        setAuthState('passed-on-first');
        setAnimationFinished(true);
        playSplash();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync();
      if (result.success) {
        playSplash();
        if (firstTry) {
          setAuthState('passed-on-first');
          void analytics?.track('app_unlocked');
        } else {
          setAuthState('passed-afterwards');
          void analytics?.track('app_unlocked');
        }
      } else {
        setAuthState('failed');
      }
    },
    [securityLevelPreference, checkUnlockTime, authState, playSplash, setAnimationFinished]
  );

  const onAppForeground = useCallback(() => {
    return tryAuthentication({ firstTry: true });
  }, [tryAuthentication]);

  const onAppBackground = useCallback(() => {
    if (securityLevelPreference === 'secure') {
      setAuthState('started');

      // add latest active timestamp only if the app was actually unlocked
      const appUnlocked = authState === 'passed-on-first' || authState === 'passed-afterwards';
      if (appUnlocked) {
        userLeavesApp(+new Date());
      }
    }
  }, [securityLevelPreference, userLeavesApp, authState]);

  const lockApp = useCallback(() => {
    setAnimationFinished(false);
    setAuthState('failed');
    userLeavesApp(null);
    void analytics?.track('app_locked');
  }, [setAnimationFinished, setAuthState, userLeavesApp]);

  useAppState({
    onAppForeground,
    onAppBackground,
  });

  return {
    tryAuthentication,
    authState,
    lockApp,
  };
}
