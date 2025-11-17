import { act, renderHook } from '@testing-library/react';
import { doNothing } from 'remeda';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInterval } from './use-interval.shared';

vi.useFakeTimers();

describe('useInterval', () => {
  beforeEach(() => vi.clearAllTimers());
  afterEach(() => vi.clearAllMocks());

  it('does not start when enabled=false', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, 1000, {
        enabled: false,
      })
    );

    expect(callback).not.toHaveBeenCalled();

    expect(result.current).toEqual({
      status: 'idle',
      interval: 1000,
      lastStartedAt: null,
      lastCompletedAt: null,
      nextRunTime: null,
    });

    act(() => {
      void vi.advanceTimersByTime(2000);
    });
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('runs immediately when runImmediately=true', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, 1000, {
        runImmediately: true,
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('scheduled');
    expect(result.current.lastStartedAt).toBeGreaterThan(0);
  });

  it('waits for interval if runImmediately=false (default)', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000, {}));

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.status).toBe('scheduled');

    act(() => void vi.advanceTimersByTime(999));
    expect(callback).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('polls repeatedly at the interval for sync callbacks', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000, {}));

    expect(callback).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => void vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => void vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('waits for async callback to resolve before scheduling next run', async () => {
    let resolveCallback: () => void;
    const callback = vi.fn().mockImplementation(() => {
      return new Promise<void>(resolve => {
        resolveCallback = resolve;
      });
    });

    const { result } = renderHook(() => useInterval(callback, 1000, {}));

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.status).toBe('scheduled');

    act(() => void vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('invoking');

    act(() => void vi.advanceTimersByTime(10000));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('invoking');

    await act(async () => {
      resolveCallback();
      await Promise.resolve();
    });
    expect(result.current.status).toBe('scheduled');
    expect(result.current.lastCompletedAt).toBeGreaterThan(0);

    act(() => {
      void vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('invoking');
  });

  it('exposes correct nextRunTime', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000, {}));

    const initialNextRunTime = result.current.nextRunTime;
    expect(initialNextRunTime).toBeGreaterThan(Date.now());
    expect(initialNextRunTime).toBeLessThanOrEqual(Date.now() + 1000);

    act(() => void vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(1);

    const newNextRunTime = result.current.nextRunTime;
    expect(newNextRunTime).not.toBe(null);
    expect(initialNextRunTime).not.toBe(null);
    expect(newNextRunTime!).toBeGreaterThan(initialNextRunTime!);
  });

  it('exposes correct lastStartedAt', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, 1000, {
        runImmediately: true,
      })
    );

    const firstStartedAt = result.current.lastStartedAt;
    expect(firstStartedAt).not.toBe(null);
    expect(firstStartedAt!).toBeGreaterThan(0);

    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.lastStartedAt).not.toBe(null);
    expect(result.current.lastStartedAt!).toBeGreaterThan(firstStartedAt!);
  });

  it('exposes correct lastCompletedAt', async () => {
    let resolveCallback: () => void;
    const callback = vi.fn().mockImplementation(() => {
      return new Promise<void>(resolve => {
        resolveCallback = resolve;
      });
    });

    const { result } = renderHook(() =>
      useInterval(callback, 1000, {
        runImmediately: true,
      })
    );

    expect(result.current.lastCompletedAt).toBe(null);

    await act(async () => {
      resolveCallback();
      await Promise.resolve();
    });

    expect(result.current.lastCompletedAt).not.toBe(null);
    expect(result.current.lastCompletedAt!).toBeGreaterThan(0);
    const firstCompletedAt = result.current.lastCompletedAt;

    act(() => void vi.advanceTimersByTime(1000));

    await act(async () => {
      resolveCallback();
      await Promise.resolve();
    });
    expect(result.current.lastCompletedAt).not.toBe(null);
    expect(result.current.lastCompletedAt!).toBeGreaterThan(firstCompletedAt!);
  });

  it('calls onError and stops when stopOnError=true', () => {
    const callback = vi.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useInterval(callback, 1000, {
        runImmediately: true,
        stopOnError: true,
        onError,
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(result.current.status).toBe('idle');
    expect(result.current.nextRunTime).toBe(null);

    act(() => {
      void vi.advanceTimersByTime(2000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('does not stop when stopOnError=false', () => {
    let errorCount = 0;
    const callback = vi.fn().mockImplementation(() => {
      errorCount++;
      if (errorCount <= 2) {
        throw new Error(`Test error ${errorCount}`);
      }
    });
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useInterval(callback, 1000, {
        runImmediately: true,
        stopOnError: false,
        onError,
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('scheduled');

    act(() => void vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('scheduled');

    act(() => void vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('scheduled');
  });

  it('cleans up timers on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000, {}));

    unmount();

    act(() => void vi.advanceTimersByTime(2000));
    expect(callback).not.toHaveBeenCalled();
  });

  it('handles status transitions correctly', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useInterval(callback, 1000, { enabled }),
      {
        initialProps: { enabled: true },
      }
    );

    expect(result.current.status).toBe('scheduled');
    expect(result.current.nextRunTime).not.toBe(null);

    rerender({ enabled: false });
    expect(result.current.status).toBe('idle');
    expect(result.current.nextRunTime).toBe(null);

    rerender({ enabled: true });
    expect(result.current.status).toBe('scheduled');
    expect(result.current.nextRunTime).not.toBe(null);
  });

  it('updates callback reference without restarting timer', () => {
    let callbackValue = 'first';
    const { rerender } = renderHook(() =>
      useInterval(
        () => {
          callbackValue = 'updated';
        },
        1000,
        {}
      )
    );

    expect(callbackValue).toBe('first');

    rerender();

    act(() => void vi.advanceTimersByTime(1000));
    expect(callbackValue).toBe('updated');
  });

  it('resets interval when toggling enabled mid-run', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ enabled }) => useInterval(callback, 5000, { enabled }), {
      initialProps: { enabled: true },
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(2000));
    expect(callback).not.toHaveBeenCalled();

    rerender({ enabled: false });
    rerender({ enabled: true });

    act(() => void vi.advanceTimersByTime(4800));
    expect(callback).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(250));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('initializes with correct state when enabled=true, runImmediately=false', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, 1000, { enabled: true, runImmediately: false })
    );

    expect(result.current.status).toBe('scheduled');
    expect(result.current.lastStartedAt).not.toBe(null);
    expect(result.current.lastStartedAt).toBeGreaterThan(0);
    expect(result.current.lastCompletedAt).toBe(null);
    expect(result.current.nextRunTime).not.toBe(null);
    expect(result.current.nextRunTime).toBeGreaterThan(result.current.lastStartedAt!);
    expect(result.current.nextRunTime).toBeLessThanOrEqual(result.current.lastStartedAt! + 1000);
  });

  it('initializes with correct state when enabled=true, runImmediately=true', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, 1000, { enabled: true, runImmediately: true })
    );

    expect(result.current.status).toBe('scheduled');
    expect(result.current.lastStartedAt).not.toBe(null);
    expect(result.current.lastStartedAt).toBeGreaterThan(0);
    expect(result.current.lastCompletedAt).not.toBe(null);
    expect(result.current.nextRunTime).not.toBe(null);
  });

  it('initializes with null timestamps when enabled=false', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000, { enabled: false }));

    expect(result.current).toEqual({
      status: 'idle',
      interval: 1000,
      lastStartedAt: null,
      lastCompletedAt: null,
      nextRunTime: null,
    });
  });

  it('sets lastStartedAt when cycle begins, not when callback invokes', async () => {
    let resolveCallback: () => void;
    const callback = vi.fn().mockImplementation(() => {
      return new Promise<void>(resolve => {
        resolveCallback = resolve;
      });
    });

    const { result } = renderHook(() => useInterval(callback, 1000, { enabled: true }));

    const initialStartedAt = result.current.lastStartedAt;
    expect(initialStartedAt).not.toBe(null);
    expect(initialStartedAt).toBeGreaterThan(0);

    act(() => void vi.advanceTimersByTime(1000));

    expect(result.current.status).toBe('invoking');
    expect(result.current.lastStartedAt).toBe(initialStartedAt);

    await act(async () => {
      resolveCallback();
      await Promise.resolve();
    });

    expect(result.current.status).toBe('scheduled');
    const afterCompletionStartedAt = result.current.lastStartedAt;
    expect(afterCompletionStartedAt).toBeGreaterThan(initialStartedAt!);

    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.status).toBe('invoking');
    expect(result.current.lastStartedAt).toBe(afterCompletionStartedAt);
  });

  it('updates lastStartedAt when new cycle begins after completion', async () => {
    let resolveCallback: () => void;
    const callback = vi.fn().mockImplementation(() => {
      return new Promise<void>(resolve => {
        resolveCallback = resolve;
      });
    });

    const { result } = renderHook(() =>
      useInterval(callback, 1000, { enabled: true, runImmediately: true })
    );

    const firstStartedAt = result.current.lastStartedAt;

    act(() => void vi.advanceTimersByTime(100));

    await act(async () => {
      resolveCallback();
      await Promise.resolve();
    });

    const afterFirstCompletion = result.current.lastStartedAt;
    expect(afterFirstCompletion).toBeGreaterThan(firstStartedAt!);
  });

  it('maintains invariant: idle status means null nextRunTime', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useInterval(callback, 1000, { enabled }),
      { initialProps: { enabled: true } }
    );

    expect(result.current.status).toBe('scheduled');
    expect(result.current.nextRunTime).not.toBe(null);

    rerender({ enabled: false });

    expect(result.current.status).toBe('idle');
    expect(result.current.nextRunTime).toBe(null);
  });

  it('maintains invariant: scheduled status means non-null nextRunTime', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000, { enabled: true }));

    expect(result.current.status).toBe('scheduled');
    expect(result.current.nextRunTime).not.toBe(null);
    expect(result.current.nextRunTime).toBeGreaterThan(0);
  });

  it('maintains invariant: invoking status means non-null nextRunTime', () => {
    const callback = vi.fn().mockImplementation(() => {
      return new Promise<void>(doNothing);
    });

    const { result } = renderHook(() => useInterval(callback, 1000, { enabled: true }));

    act(() => void vi.advanceTimersByTime(1000));

    expect(result.current.status).toBe('invoking');
    expect(result.current.nextRunTime).not.toBe(null);
    expect(result.current.nextRunTime).toBeGreaterThan(0);
  });

  it('maintains invariant: lastStartedAt is before or equal to nextRunTime', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000, { enabled: true }));

    expect(result.current.lastStartedAt).not.toBe(null);
    expect(result.current.nextRunTime).not.toBe(null);
    expect(result.current.lastStartedAt).toBeLessThanOrEqual(result.current.nextRunTime!);

    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.lastStartedAt).not.toBe(null);
    expect(result.current.nextRunTime).not.toBe(null);
    expect(result.current.lastStartedAt).toBeLessThanOrEqual(result.current.nextRunTime!);
  });

  it('preserves lastStartedAt and lastCompletedAt when error stops interval', () => {
    const callback = vi
      .fn()
      .mockImplementationOnce(doNothing)
      .mockImplementationOnce(() => {
        throw new Error('Test error');
      });

    const { result } = renderHook(() =>
      useInterval(callback, 1000, { runImmediately: true, stopOnError: true })
    );

    act(() => {
      void vi.advanceTimersByTime(1000);
    });

    const startedAt = result.current.lastStartedAt;
    const completedAt = result.current.lastCompletedAt;

    act(() => {
      void vi.advanceTimersByTime(1000);
    });

    expect(result.current).toEqual({
      status: 'idle',
      interval: 1000,
      lastStartedAt: startedAt,
      lastCompletedAt: completedAt,
      nextRunTime: null,
    });
  });

  it('restarts as fresh initialization when re-enabled', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useInterval(callback, 1000, { enabled, runImmediately: false }),
      { initialProps: { enabled: true } }
    );

    const firstStartedAt = result.current.lastStartedAt;

    rerender({ enabled: false });

    expect(result.current.status).toBe('idle');
    expect(result.current.nextRunTime).toBe(null);

    act(() => void vi.advanceTimersByTime(100));

    rerender({ enabled: true });

    expect(result.current.status).toBe('scheduled');
    expect(result.current.lastStartedAt).not.toBe(null);
    expect(result.current.lastStartedAt).toBeGreaterThan(firstStartedAt!);
    expect(result.current.nextRunTime).not.toBe(null);
    expect(result.current.nextRunTime).toBeGreaterThan(result.current.lastStartedAt!);
  });
});
