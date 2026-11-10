import { describe, expect, test } from 'vitest';

import {
  type ConsoleEntry,
  blockingConsoleEntries,
  fallbackAbortNoise,
  summarizeConsole,
} from './console-verdict.js';

function entry(overrides: Partial<ConsoleEntry>): ConsoleEntry {
  return { page: 'page-1', level: 'error', text: 'x', at: 1, ...overrides };
}

describe(fallbackAbortNoise.name, () => {
  const aborted = entry({
    text: 'Failed to load resource: net::ERR_FAILED',
    location: 'https://api.example/v1/thing:0',
  });
  const realFailure = entry({
    text: 'Failed to load resource: net::ERR_FAILED',
    location: 'https://other.example/v1/thing:0',
  });
  const pageError = entry({ level: 'pageerror', text: 'TypeError: boom' });
  const isNoise = fallbackAbortNoise(new Set(['https://api.example/v1/thing']));

  test('treats ERR_FAILED console lines for fallback-aborted urls as non-blocking', () => {
    expect(isNoise(aborted)).toBe(true);
    expect(isNoise(realFailure)).toBe(false);
    expect(isNoise(pageError)).toBe(false);
    expect(blockingConsoleEntries([aborted, realFailure, pageError], [], isNoise)).toEqual([
      realFailure,
      pageError,
    ]);
    expect(summarizeConsole([aborted, realFailure, pageError], [], isNoise)).toEqual({
      total: 3,
      errors: 2,
      pageErrors: 1,
      allowlisted: 0,
      blocking: 2,
    });
  });
});
