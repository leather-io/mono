import { useEffect, useReducer, useRef } from 'react';

import { isPromise } from 'remeda';

type UseIntervalStatus = 'idle' | 'invoking' | 'scheduled';
type UseIntervalCallback = () => void | Promise<void>;

interface UseIntervalState {
  status: UseIntervalStatus;
  lastStartedAt: number;
  lastCompletedAt: number;
  nextRunTime: number;
}

type UseIntervalAction =
  | { type: 'INVOKE' }
  | { type: 'INVOCATION_COMPLETED' }
  | { type: 'SCHEDULE'; nextRunTime: number }
  | { type: 'STOP' };

interface UseIntervalOptions {
  enabled?: boolean;
  runImmediately?: boolean;
  stopOnError?: boolean;
  onError?: (error: unknown) => void;
}

interface UseIntervalResult {
  status: UseIntervalStatus;
  lastStartedAt: number;
  lastCompletedAt: number;
  nextRunTime: number;
}

/**
 * Repeatedly executes a callback on a fixed interval, waiting for the callback
 * to finish (sync or async) before scheduling the next run.
 *
 * @param callback      Function to run on each interval. May return a Promise.
 * @param interval    Delay between runs in milliseconds.
 * @param options
 * @param options.enabled         Whether execution is active (default: true).
 * @param options.runImmediately  Run once immediately on mount before the first interval (default: false).
 * @param options.stopOnError     Stop scheduling future runs if the callback throws (default: false).
 * @param options.onError         Optional error handler for thrown callback errors.
 *
 * @returns {
 *   status: 'idle' | 'invoking' | 'scheduled',
 *   lastStartedAt: number,
 *   lastCompletedAt: number,
 *   nextRunTime: number
 * }
 */
export function useInterval(
  callback: UseIntervalCallback,
  interval: number,
  { enabled = true, runImmediately = false, stopOnError = false, onError }: UseIntervalOptions
): UseIntervalResult {
  const [state, dispatch] = useReducer(reducer, {
    status: 'idle',
    lastStartedAt: 0,
    lastCompletedAt: 0,
    nextRunTime: 0,
  });

  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) {
      dispatch({ type: 'STOP' });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }

    let isActive = true;

    function executeCallback() {
      if (!isActive) return;

      dispatch({ type: 'INVOKE' });

      async function executeAndSchedule() {
        try {
          const result = callbackRef.current();
          if (isPromise(result)) await result;
        } catch (error) {
          onError?.(error);

          if (stopOnError) {
            dispatch({ type: 'STOP' });
            return;
          }
        }

        if (!isActive) return;

        dispatch({ type: 'INVOCATION_COMPLETED' });
        scheduleNextRun();
      }

      void executeAndSchedule();
    }

    function scheduleNextRun() {
      if (!isActive) return;

      const nextRunTime = Date.now() + interval;
      dispatch({ type: 'SCHEDULE', nextRunTime });

      timerRef.current = setTimeout(() => {
        if (isActive) executeCallback();
      }, interval);
    }

    if (runImmediately) {
      executeCallback();
    } else {
      scheduleNextRun();
    }

    return () => {
      isActive = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [enabled, interval, runImmediately, stopOnError, onError]);

  return {
    status: state.status,
    lastStartedAt: state.lastStartedAt,
    lastCompletedAt: state.lastCompletedAt,
    nextRunTime: state.nextRunTime,
  };
}

function reducer(state: UseIntervalState, action: UseIntervalAction): UseIntervalState {
  switch (action.type) {
    case 'INVOKE':
      return { ...state, status: 'invoking', lastStartedAt: Date.now(), nextRunTime: 0 };
    case 'INVOCATION_COMPLETED':
      return { ...state, lastCompletedAt: Date.now() };
    case 'SCHEDULE':
      return { ...state, status: 'scheduled', nextRunTime: action.nextRunTime };
    case 'STOP':
      return { ...state, status: 'idle', nextRunTime: 0 };
    default:
      return state;
  }
}
