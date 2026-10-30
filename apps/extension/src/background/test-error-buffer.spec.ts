import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { logger as sharedLogger } from '@shared/logger';
import {
  backgroundErrorsSchema,
  backgroundErrorsStorageKey,
} from '@shared/storage/background-errors';

vi.mock('@shared/environment', () => ({ IS_TEST_ENV: true }));

type Listener = (event: { message?: string; reason?: unknown }) => void;

function createSessionArea() {
  const store = new Map<string, unknown>();
  return {
    get(keys: string[]) {
      const result: Record<string, unknown> = {};
      for (const key of keys) if (store.has(key)) result[key] = store.get(key);
      return Promise.resolve(result);
    },
    set(items: Record<string, unknown>) {
      for (const [key, value] of Object.entries(items)) store.set(key, value);
      return Promise.resolve();
    },
  };
}

async function flush() {
  for (let tick = 0; tick < 10; tick++) await new Promise(resolve => setTimeout(resolve, 0));
}

describe('initTestErrorBuffer', () => {
  const listeners = new Map<string, Listener>();
  let session: ReturnType<typeof createSessionArea>;
  let logger: typeof sharedLogger;
  const originalConsoleError = globalThis.console.error;

  beforeEach(async () => {
    vi.resetModules();
    session = createSessionArea();
    listeners.clear();
    vi.stubGlobal('chrome', { storage: { session } });
    vi.stubGlobal('self', {
      addEventListener(type: string, listener: Listener) {
        listeners.set(type, listener);
      },
    });
    vi.spyOn(globalThis.console, 'error').mockImplementation(() => undefined);
    ({ logger } = await import('@shared/logger'));
    const { initTestErrorBuffer } = await import('./test-error-buffer');
    initTestErrorBuffer();
    await flush();
  });

  afterEach(() => {
    globalThis.console.error = originalConsoleError;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function readRecords() {
    const stored = await session.get([backgroundErrorsStorageKey]);
    return backgroundErrorsSchema.parse(stored[backgroundErrorsStorageKey] ?? []);
  }

  test('seeds an empty list so a test build is told apart from one that records nothing', async () => {
    const stored = await session.get([backgroundErrorsStorageKey]);
    expect(stored[backgroundErrorsStorageKey]).toEqual([]);
  });

  test('records logger.error calls, console.error calls and uncaught errors in order', async () => {
    logger.error('Mempool WebSocket Error', new Error('socket closed'));
    globalThis.console.error('plain console error', 42);
    listeners.get('error')?.({ message: 'uncaught boom' });
    listeners.get('unhandledrejection')?.({ reason: new Error('rejected') });
    await flush();
    expect((await readRecords()).map(record => record.message)).toEqual([
      'Mempool WebSocket Error Error: socket closed',
      'plain console error 42',
      'uncaught boom',
      'Error: rejected',
    ]);
  });

  test('keeps the records in one storage list with timestamps', async () => {
    logger.error('first');
    logger.error('second');
    await flush();
    const records = await readRecords();
    expect(records).toHaveLength(2);
    expect(records.every(record => !Number.isNaN(Date.parse(record.ts)))).toBe(true);
  });

  test('keeps recording after a storage write fails instead of re-enqueueing the failure', async () => {
    const originalSet = session.set.bind(session);
    const state = { failed: false };
    session.set = items => {
      if (state.failed) return originalSet(items);
      state.failed = true;
      return Promise.reject(new Error('quota exceeded'));
    };
    logger.error('lost');
    logger.error('kept');
    await flush();
    expect((await readRecords()).map(record => record.message)).toEqual(['kept']);
  });
});
