import { useCallback, useReducer } from 'react';

import { useAuthentication } from '@/hooks/use-authentication';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';

export type AuthStatus =
  | 'cold-start'
  | 'started'
  | 'failed'
  | 'passed-on-first'
  | 'passed-afterwards';

interface AuthState {
  status: AuthStatus;
  isUnlocked: boolean;
}

type AuthAction =
  | { type: 'unlockOnOpen' }
  | { type: 'unlockManually' }
  | { type: 'lockOnBackground' }
  | { type: 'unlockOnForeground' }
  | { type: 'lockManually' }
  | { type: 'authFailed' }
  | { type: 'onFinishAnimation' };

// Initial state
const initialState: AuthState = {
  status: 'cold-start',
  isUnlocked: false,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'lockOnBackground': {
      return {
        status: 'started',
        isUnlocked: false,
      };
    }
    case 'lockManually': {
      return {
        status: 'failed',
        isUnlocked: false,
      };
    }
    case 'unlockOnForeground': {
      return {
        status: 'passed-on-first',
        isUnlocked: true,
      };
    }
    case 'unlockOnOpen': {
      return {
        status: 'passed-on-first',
        isUnlocked: false,
      };
    }
    case 'unlockManually': {
      return {
        status: 'passed-afterwards',
        isUnlocked: false,
      };
    }
    case 'authFailed': {
      return {
        status: 'failed',
        isUnlocked: false,
      };
    }
    case 'onFinishAnimation': {
      return {
        ...state,
        isUnlocked: true,
      };
    }
    default:
      throw new Error('Wrong action dispatched in browser search state');
  }
}

const unlockTimeout = 60 * 1000;
function checkUnlockTime(lastActive: number) {
  return lastActive > +new Date() - unlockTimeout;
}

export function useAuthState({ playSplash }: { playSplash(): void }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { userLeavesApp, lastActive } = useSettings();
  const { authenticate } = useAuthentication();

  const unlockOnOpen = useCallback(
    async function () {
      const result = await authenticate();
      if (result && result.success) {
        playSplash();
        dispatch({ type: 'unlockOnOpen' });
        void analytics?.track('app_unlocked');
      } else {
        dispatch({ type: 'authFailed' });
      }
    },
    [authenticate, playSplash]
  );

  const unlockManually = useCallback(
    async function () {
      const result = await authenticate();
      if (result && result.success) {
        playSplash();
        dispatch({ type: 'unlockManually' });
        void analytics?.track('app_unlocked');
      } else {
        dispatch({ type: 'authFailed' });
      }
    },
    [authenticate, playSplash]
  );

  const lockOnBackground = useCallback(
    function () {
      dispatch({ type: 'lockOnBackground' });

      // add latest active timestamp only if the app was actually unlocked
      const appUnlocked =
        state.status === 'passed-on-first' || state.status === 'passed-afterwards';
      if (appUnlocked) {
        userLeavesApp(+new Date());
      }
    },
    [state.status, userLeavesApp]
  );

  const unlockOnForeground = useCallback(
    async function () {
      // if in secure mode, skip checks only if unlock time is not exceeding the timeout
      // and this is not a cold start of the app
      if (state.status !== 'cold-start' && lastActive && checkUnlockTime(lastActive)) {
        dispatch({ type: 'unlockOnForeground' });
        playSplash();
        return;
      }
      await unlockOnOpen();
    },
    [lastActive, playSplash, state.status, unlockOnOpen]
  );
  const lockManually = useCallback(
    function () {
      dispatch({ type: 'lockManually' });
      userLeavesApp(null);
      void analytics?.track('app_locked');
    },
    [userLeavesApp]
  );

  const onFinishAnimation = useCallback(function onFinishAnimation() {
    dispatch({ type: 'onFinishAnimation' });
  }, []);
  const bypassSecurity = useCallback(function bypassSecurity() {
    dispatch({ type: 'unlockOnOpen' });
  }, []);

  return {
    authState: state,
    unlockOnOpen,
    unlockManually,
    lockOnBackground,
    unlockOnForeground,
    lockManually,
    onFinishAnimation,
    bypassSecurity,
  };
}
