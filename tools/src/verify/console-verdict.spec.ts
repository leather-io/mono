import { describe, expect, test } from 'vitest';

import {
  type ConsoleEntry,
  blockingConsoleEntries,
  isAllowlisted,
  summarizeConsole,
} from './console-verdict.js';

const allowlist = [
  '<svg> attribute height: Expected length, "auto"',
  '404 (Not Found) https://staging.api.leather.io/v1/tokens/sip10s/',
];

function entry(overrides: Partial<ConsoleEntry>): ConsoleEntry {
  return { page: 'page-1', level: 'log', text: 'hello', at: 1, ...overrides };
}

const entries: ConsoleEntry[] = [
  entry({ level: 'log' }),
  entry({ level: 'warning', text: 'careful' }),
  entry({
    level: 'error',
    text: 'Error: <svg> attribute height: Expected length, "auto".',
    location: 'chrome-extension://abc/assets/index.js:10',
  }),
  entry({
    level: 'error',
    text: 'Failed to load resource: the server responded with a status of 404 (Not Found)',
    location: 'https://staging.api.leather.io/v1/tokens/sip10s/:0',
  }),
  entry({ level: 'error', text: 'TypeError: Failed to fetch', location: 'https://x.example/a:1' }),
  entry({ level: 'pageerror', text: 'ReferenceError: foo is not defined' }),
];

describe(isAllowlisted.name, () => {
  test('matches a substring of the text joined with the location', () => {
    expect(isAllowlisted(entries[3] ?? entry({}), allowlist)).toBe(true);
    expect(isAllowlisted(entries[4] ?? entry({}), allowlist)).toBe(false);
  });
});

describe(summarizeConsole.name, () => {
  test('counts errors, page errors and allowlisted entries, and what blocks', () => {
    expect(summarizeConsole(entries, allowlist)).toEqual({
      total: 6,
      errors: 3,
      pageErrors: 1,
      allowlisted: 2,
      blocking: 2,
    });
    expect(blockingConsoleEntries(entries, allowlist).map(item => item.text)).toEqual([
      'TypeError: Failed to fetch',
      'ReferenceError: foo is not defined',
    ]);
  });
});
