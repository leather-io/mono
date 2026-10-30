import { IS_TEST_ENV } from '@shared/environment';
import { onLoggerError } from '@shared/logger';
import {
  type BackgroundErrorRecord,
  backgroundErrorsLimit,
  backgroundErrorsSchema,
  backgroundErrorsStorageKey,
} from '@shared/storage/background-errors';

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
  const parsed = backgroundErrorsSchema.safeParse(stored[backgroundErrorsStorageKey]);
  const existing: BackgroundErrorRecord[] = parsed.success ? parsed.data : [];
  const record: BackgroundErrorRecord = { ts: new Date().toISOString(), message };
  const next = [...existing, record].slice(-backgroundErrorsLimit);
  await chrome.storage.session.set({ [backgroundErrorsStorageKey]: next });
}

async function seedBackgroundErrors() {
  const stored = await chrome.storage.session.get([backgroundErrorsStorageKey]);
  if (stored[backgroundErrorsStorageKey] !== undefined) return;
  await chrome.storage.session.set({ [backgroundErrorsStorageKey]: [] });
}

async function appendAfter(previous: Promise<void>, message: string) {
  await previous;
  await appendBackgroundError(message).catch(() => undefined);
}

let pendingAppend: Promise<void> = Promise.resolve();
let initialised = false;

function enqueueBackgroundError(message: string): Promise<void> {
  pendingAppend = appendAfter(pendingAppend, message);
  return pendingAppend;
}

export function initTestErrorBuffer() {
  if (!IS_TEST_ENV || initialised) return;
  initialised = true;
  pendingAppend = seedBackgroundErrors().catch(() => undefined);
  self.addEventListener('error', event => {
    void enqueueBackgroundError(event.message);
  });
  self.addEventListener('unhandledrejection', event => {
    void enqueueBackgroundError(describeValue(event.reason));
  });
  onLoggerError(message => {
    void enqueueBackgroundError(message);
  });
  const originalConsoleError = globalThis.console.error;
  globalThis.console.error = (...args: unknown[]) => {
    void enqueueBackgroundError(args.map(describeValue).join(' '));
    originalConsoleError.apply(globalThis.console, args);
  };
}
