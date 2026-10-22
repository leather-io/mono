import { z } from 'zod';

import { IS_TEST_ENV } from '@shared/environment';
import {
  type BackgroundErrorRecord,
  backgroundErrorsLimit,
  backgroundErrorsStorageKey,
} from '@shared/storage/background-errors';

const storedBackgroundErrorsSchema = z.array(z.object({ ts: z.string(), message: z.string() }));

function describeValue(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  return Object.prototype.toString.call(value);
}

async function appendBackgroundError(message: string) {
  const stored = await chrome.storage.session.get([backgroundErrorsStorageKey]);
  const parsed = storedBackgroundErrorsSchema.safeParse(stored[backgroundErrorsStorageKey]);
  const existing: BackgroundErrorRecord[] = parsed.success ? parsed.data : [];
  const record: BackgroundErrorRecord = { ts: new Date().toISOString(), message };
  const next = [...existing, record].slice(-backgroundErrorsLimit);
  await chrome.storage.session.set({ [backgroundErrorsStorageKey]: next });
}

async function appendAfter(previous: Promise<void>, message: string) {
  await previous.catch(() => undefined);
  await appendBackgroundError(message);
}

let pendingAppend: Promise<void> = Promise.resolve();

function enqueueBackgroundError(message: string) {
  pendingAppend = appendAfter(pendingAppend, message);
}

export function initTestErrorBuffer() {
  if (!IS_TEST_ENV) return;
  self.addEventListener('error', event => {
    enqueueBackgroundError(event.message);
  });
  self.addEventListener('unhandledrejection', event => {
    enqueueBackgroundError(describeValue(event.reason));
  });
  const originalConsoleError = globalThis.console.error;
  globalThis.console.error = (...args: unknown[]) => {
    enqueueBackgroundError(args.map(describeValue).join(' '));
    originalConsoleError.apply(globalThis.console, args);
  };
}
