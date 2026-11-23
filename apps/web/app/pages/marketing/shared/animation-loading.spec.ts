import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  animationLoadTimeoutMs,
  animationMaxAttempts,
  animationRetryDelayMs,
  loadAnimationWithRetry,
} from './animation-loading';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe(loadAnimationWithRetry.name, () => {
  test('keeps a delayed first load pending and returns it without another attempt', async () => {
    const result = { ready: true };
    const load = vi.fn(
      () => new Promise<typeof result>(resolve => setTimeout(() => resolve(result), 1000))
    );
    const pending = loadAnimationWithRetry(load, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(999);
    expect(load).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toBe(result);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('recovers from a rejected request in the same session', async () => {
    const load = vi
      .fn<() => Promise<string | null>>()
      .mockRejectedValueOnce(new Error('temporarily unavailable'))
      .mockResolvedValueOnce('ready');
    const pending = loadAnimationWithRetry(load, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(animationRetryDelayMs);
    expect(await pending).toBe('ready');
    expect(load).toHaveBeenCalledTimes(2);
  });

  test('stops after its bounded retry budget and leaves the fallback available', async () => {
    const load = vi.fn(() => Promise.resolve(null));
    const pending = loadAnimationWithRetry(load, new AbortController().signal);
    await vi.runAllTimersAsync();
    expect(await pending).toBeNull();
    expect(load).toHaveBeenCalledTimes(animationMaxAttempts);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('times out a stuck attempt and recovers on the next one', async () => {
    const signals: AbortSignal[] = [];
    const load = vi.fn((signal: AbortSignal) => {
      signals.push(signal);
      if (signals.length === 1) return new Promise<string>(() => undefined);
      return Promise.resolve('ready');
    });
    const pending = loadAnimationWithRetry(load, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(animationLoadTimeoutMs + animationRetryDelayMs);
    expect(await pending).toBe('ready');
    expect(signals[0]?.aborted).toBe(true);
    expect(load).toHaveBeenCalledTimes(2);
  });

  test('ignores an expired attempt that resolves after its replacement succeeds', async () => {
    let finishExpired: ((result: string) => void) | undefined;
    const signals: AbortSignal[] = [];
    const load = vi.fn((signal: AbortSignal) => {
      signals.push(signal);
      if (signals.length === 1) {
        return new Promise<string>(resolve => {
          finishExpired = resolve;
        });
      }
      return Promise.resolve('replacement');
    });
    const pending = loadAnimationWithRetry(load, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(animationLoadTimeoutMs + animationRetryDelayMs);
    expect(await pending).toBe('replacement');
    finishExpired?.('expired');
    await vi.advanceTimersByTimeAsync(0);
    expect(signals[0]?.aborted).toBe(true);
    expect(load).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('cancels an in-flight load and does not retry after unmount', async () => {
    const controller = new AbortController();
    const load = vi.fn(() => new Promise<string>(() => undefined));
    const pending = loadAnimationWithRetry(load, controller.signal);
    controller.abort();
    expect(await pending).toBeNull();
    await vi.runAllTimersAsync();
    expect(load).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('cancels the backoff timer when its lifetime ends', async () => {
    const controller = new AbortController();
    const load = vi.fn(() => Promise.resolve(null));
    const pending = loadAnimationWithRetry(load, controller.signal);
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    expect(await pending).toBeNull();
    await vi.runAllTimersAsync();
    expect(load).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('does not start when its lifetime has already ended', async () => {
    const controller = new AbortController();
    controller.abort();
    const load = vi.fn(() => Promise.resolve('ready'));
    expect(await loadAnimationWithRetry(load, controller.signal)).toBeNull();
    expect(load).not.toHaveBeenCalled();
  });
});
