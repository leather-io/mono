import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useClipboard } from './use-clipboard.web';

interface DeferredWriteControls {
  resolve(): void;
  reject(): void;
}

function deferredWrite() {
  const controls: DeferredWriteControls = {
    resolve() {
      return undefined;
    },
    reject() {
      return undefined;
    },
  };
  const promise = new Promise<void>((resolve, reject) => {
    controls.resolve = resolve;
    controls.reject = () => reject(new Error('Clipboard permission denied'));
  });
  return { ...controls, promise };
}

function startCopy(onCopy: () => Promise<boolean | undefined>) {
  const pending = { completion: Promise.resolve<boolean | undefined>(undefined) };
  act(() => {
    pending.completion = onCopy();
  });
  return pending.completion;
}

const writeText = vi.fn<(value: string) => Promise<void>>();

describe(useClipboard.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    vi.stubGlobal('navigator', { clipboard: { writeText } });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('waits for the clipboard write before showing success, then resets it', async () => {
    const deferred = deferredWrite();
    writeText.mockReturnValue(deferred.promise);
    const { result } = renderHook(() => useClipboard('selected-address'));
    const completion = startCopy(result.current.onCopy);

    expect(writeText).toHaveBeenCalledWith('selected-address');
    expect(result.current.hasCopied).toBe(false);
    await act(async () => {
      deferred.resolve();
      expect(await completion).toBe(true);
    });
    expect(result.current.hasCopied).toBe(true);
    expect(result.current.hasCopyFailed).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1250);
    });
    expect(result.current.hasCopied).toBe(false);
  });

  test('returns failure without showing Copied when the clipboard rejects the write', async () => {
    writeText.mockRejectedValue(new Error('Clipboard permission denied'));
    const { result } = renderHook(() => useClipboard('selected-address'));

    await act(async () => {
      expect(await result.current.onCopy()).toBe(false);
    });

    expect(result.current.hasCopied).toBe(false);
    expect(result.current.hasCopyFailed).toBe(true);
  });

  test('returns failure when clipboard access is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    const { result } = renderHook(() => useClipboard('selected-address'));

    await act(async () => {
      expect(await result.current.onCopy()).toBe(false);
    });

    expect(result.current.hasCopied).toBe(false);
    expect(result.current.hasCopyFailed).toBe(true);
  });

  test('keeps the newest copy feedback for its full duration after a repeated copy', async () => {
    writeText.mockResolvedValue();
    const { result } = renderHook(() => useClipboard('selected-address'));
    await act(async () => {
      expect(await result.current.onCopy()).toBe(true);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await act(async () => {
      expect(await result.current.onCopy()).toBe(true);
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current.hasCopied).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.hasCopied).toBe(false);
  });

  test('does not let an older success replace the newest failed attempt', async () => {
    const older = deferredWrite();
    const newest = deferredWrite();
    writeText.mockReturnValueOnce(older.promise).mockReturnValueOnce(newest.promise);
    const { result } = renderHook(() => useClipboard('selected-address'));
    const olderCompletion = startCopy(result.current.onCopy);
    const newestCompletion = startCopy(result.current.onCopy);

    await act(async () => {
      newest.reject();
      expect(await newestCompletion).toBe(false);
    });
    await act(async () => {
      older.resolve();
      expect(await olderCompletion).toBeUndefined();
    });

    expect(result.current.hasCopied).toBe(false);
    expect(result.current.hasCopyFailed).toBe(true);
  });

  test('clears failed feedback when a retry succeeds', async () => {
    writeText.mockRejectedValueOnce(new Error('Clipboard permission denied')).mockResolvedValue();
    const { result } = renderHook(() => useClipboard('selected-address'));
    await act(async () => {
      expect(await result.current.onCopy()).toBe(false);
    });
    expect(result.current.hasCopyFailed).toBe(true);
    await act(async () => {
      expect(await result.current.onCopy()).toBe(true);
    });
    expect(result.current.hasCopied).toBe(true);
    expect(result.current.hasCopyFailed).toBe(false);
  });

  test('does not let an older failure replace the newest successful attempt', async () => {
    const older = deferredWrite();
    const newest = deferredWrite();
    writeText.mockReturnValueOnce(older.promise).mockReturnValueOnce(newest.promise);
    const { result } = renderHook(() => useClipboard('selected-address'));
    const olderCompletion = startCopy(result.current.onCopy);
    const newestCompletion = startCopy(result.current.onCopy);
    await act(async () => {
      newest.resolve();
      expect(await newestCompletion).toBe(true);
    });
    await act(async () => {
      older.reject();
      expect(await olderCompletion).toBeUndefined();
    });
    expect(result.current.hasCopied).toBe(true);
    expect(result.current.hasCopyFailed).toBe(false);
  });

  test.each<'resolve' | 'reject'>(['resolve', 'reject'])(
    'cancels a pending %s result when the selected address changes',
    async settle => {
      const deferred = deferredWrite();
      writeText.mockReturnValue(deferred.promise);
      const { result, rerender } = renderHook(({ value }) => useClipboard(value), {
        initialProps: { value: 'first-address' },
      });
      const completion = startCopy(result.current.onCopy);
      rerender({ value: 'second-address' });
      await act(async () => {
        deferred[settle]();
        expect(await completion).toBeUndefined();
      });
      expect(result.current.value).toBe('second-address');
      expect(result.current.hasCopied).toBe(false);
      expect(result.current.hasCopyFailed).toBe(false);
    }
  );

  test('clears success when the selected address changes', async () => {
    writeText.mockResolvedValue();
    const { result, rerender } = renderHook(({ value }) => useClipboard(value), {
      initialProps: { value: 'first-address' },
    });
    await act(async () => {
      await result.current.onCopy();
    });
    expect(result.current.hasCopied).toBe(true);
    rerender({ value: 'second-address' });
    expect(result.current.hasCopied).toBe(false);
  });

  test.each<'resolve' | 'reject'>(['resolve', 'reject'])(
    'cancels a pending %s result without leaving a timer after unmount',
    async settle => {
      const deferred = deferredWrite();
      writeText.mockReturnValue(deferred.promise);
      const { result, unmount } = renderHook(() => useClipboard('selected-address'));
      const completion = startCopy(result.current.onCopy);
      unmount();
      deferred[settle]();
      expect(await completion).toBeUndefined();
      expect(vi.getTimerCount()).toBe(0);
    }
  );
});
