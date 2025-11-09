import { act, renderHook } from '@testing-library/react';
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
    expect(result.current.status).toBe('idle');

    act(() => {
      vi.advanceTimersByTime(2000);
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

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('polls repeatedly at the interval for sync callbacks', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000, {}));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
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

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('invoking');

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('invoking');

    await act(async () => {
      resolveCallback();
      await Promise.resolve();
    });
    expect(result.current.status).toBe('scheduled');
    expect(result.current.lastCompletedAt).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(1000);
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

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    const newNextRunTime = result.current.nextRunTime;
    expect(newNextRunTime).toBeGreaterThan(initialNextRunTime);
  });

  it('exposes correct lastStartedAt', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, 1000, {
        runImmediately: true,
      })
    );

    const firstStartedAt = result.current.lastStartedAt;
    expect(firstStartedAt).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.lastStartedAt).toBeGreaterThan(firstStartedAt);
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

    expect(result.current.lastCompletedAt).toBe(0);

    await act(async () => {
      resolveCallback();
      await Promise.resolve();
    });

    expect(result.current.lastCompletedAt).toBeGreaterThan(0);
    const firstCompletedAt = result.current.lastCompletedAt;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await act(async () => {
      resolveCallback();
      await Promise.resolve();
    });
    expect(result.current.lastCompletedAt).toBeGreaterThan(firstCompletedAt);
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

    act(() => {
      vi.advanceTimersByTime(2000);
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

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('scheduled');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('scheduled');
  });

  it('cleans up timers on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000, {}));

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
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

    rerender({ enabled: false });
    expect(result.current.status).toBe('idle');

    rerender({ enabled: true });
    expect(result.current.status).toBe('scheduled');
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

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callbackValue).toBe('updated');
  });

  it('resets interval when toggling enabled mid-run', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ enabled }) => useInterval(callback, 5000, { enabled }), {
      initialProps: { enabled: true },
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(callback).not.toHaveBeenCalled();

    rerender({ enabled: false });
    rerender({ enabled: true });

    act(() => {
      vi.advanceTimersByTime(4800);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
