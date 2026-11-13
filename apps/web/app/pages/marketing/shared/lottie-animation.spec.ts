import { describe, expect, test, vi } from 'vitest';

import { waitForLottieReady } from './lottie-animation';

function createReadinessItem(isLoaded = false, imagesReady = false) {
  const listeners = new Map<string, Set<() => void>>();
  return {
    isLoaded,
    imagePreloader: {
      loadedImages() {
        return imagesReady;
      },
    },
    listeners,
    addEventListener(name: string, callback: () => void) {
      const callbacks = listeners.get(name) ?? new Set<() => void>();
      callbacks.add(callback);
      listeners.set(name, callbacks);
      return () => callbacks.delete(callback);
    },
    removeEventListener(name: string, callback?: () => void) {
      if (callback) listeners.get(name)?.delete(callback);
      else listeners.delete(name);
    },
    emit(name: string) {
      listeners.get(name)?.forEach(callback => callback());
    },
    listenerCount() {
      return [...listeners.values()].reduce((count, callbacks) => count + callbacks.size, 0);
    },
  };
}

describe(waitForLottieReady.name, () => {
  test('keeps the poster until both SVG and delayed images are ready', async () => {
    const item = createReadinessItem();
    const settled = vi.fn();
    const pending = waitForLottieReady(item, true, new AbortController().signal);
    async function observe() {
      settled(await pending);
    }
    void observe();
    item.emit('DOMLoaded');
    item.emit('DOMLoaded');
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    item.emit('loaded_images');
    expect(await pending).toBe(true);
    expect(item.listenerCount()).toBe(0);
  });

  test('handles image readiness arriving before SVG readiness', async () => {
    const item = createReadinessItem();
    const pending = waitForLottieReady(item, true, new AbortController().signal);
    item.emit('loaded_images');
    item.emit('DOMLoaded');
    expect(await pending).toBe(true);
  });

  test('accepts an already initialized vector animation without waiting for a past event', async () => {
    const item = createReadinessItem(true);
    expect(await waitForLottieReady(item, false, new AbortController().signal)).toBe(true);
    expect(item.listenerCount()).toBe(0);
  });

  test('accepts cached bitmaps whose ready event already occurred', async () => {
    const item = createReadinessItem(true, true);
    expect(await waitForLottieReady(item, true, new AbortController().signal)).toBe(true);
    expect(item.listenerCount()).toBe(0);
  });

  test('does not mistake SVG isLoaded for pending bitmap readiness', async () => {
    const item = createReadinessItem(true, false);
    const settled = vi.fn();
    const pending = waitForLottieReady(item, true, new AbortController().signal);
    async function observe() {
      settled(await pending);
    }
    void observe();
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    item.emit('loaded_images');
    expect(await pending).toBe(true);
  });

  test('does not expose cached images before the SVG itself is initialized', async () => {
    const item = createReadinessItem(false, true);
    const settled = vi.fn();
    const pending = waitForLottieReady(item, true, new AbortController().signal);
    async function observe() {
      settled(await pending);
    }
    void observe();
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    item.emit('DOMLoaded');
    expect(await pending).toBe(true);
  });

  test('releases listeners on load failure so the caller can retry', async () => {
    const item = createReadinessItem();
    const pending = waitForLottieReady(item, false, new AbortController().signal);
    item.emit('data_failed');
    expect(await pending).toBe(false);
    expect(item.listenerCount()).toBe(0);
  });

  test('cancels readiness and removes listeners when its lifetime ends', async () => {
    const item = createReadinessItem();
    const controller = new AbortController();
    const pending = waitForLottieReady(item, true, controller.signal);
    controller.abort();
    expect(await pending).toBe(false);
    expect(item.listenerCount()).toBe(0);
  });
});
