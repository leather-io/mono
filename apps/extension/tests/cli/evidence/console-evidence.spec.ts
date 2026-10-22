import {
  type ConsoleEntry,
  type ConsoleRecord,
  allowlistHaystack,
  findBlockingErrors,
  isAllowlisted,
  listPageErrors,
  shouldRecord,
  summarizeConsole,
} from './console-evidence';

const bundleLocation = { url: 'chrome-extension://abc/index.html', lineNumber: 1, columnNumber: 1 };
const tokenLocation = {
  url: 'https://staging.api.leather.io/v1/tokens/sip10s/SP1.nope',
  lineNumber: 0,
  columnNumber: 0,
};
const resourceFailure =
  'Failed to load resource: the server responded with a status of 404 (Not Found)';

const entries: ConsoleEntry[] = [
  { ts: '2026-10-22T10:00:00.000Z', type: 'log', text: 'booted', location: bundleLocation },
  { ts: '2026-10-22T10:00:01.000Z', type: 'info', text: 'hydrated', location: bundleLocation },
  { ts: '2026-10-22T10:00:02.000Z', type: 'warning', text: 'slow query', location: bundleLocation },
  {
    ts: '2026-10-22T10:00:03.000Z',
    type: 'error',
    text: 'known noise: ignore me',
    location: bundleLocation,
  },
  { ts: '2026-10-22T10:00:04.000Z', type: 'error', text: 'real failure', location: bundleLocation },
  { ts: '2026-10-22T10:00:05.000Z', type: 'error', text: resourceFailure, location: tokenLocation },
  {
    ts: '2026-10-22T10:00:06.000Z',
    type: 'pageerror',
    name: 'TypeError',
    message: 'x is not a function',
  },
];

const allowlist = [
  'known noise',
  '404 (Not Found) https://staging.api.leather.io/v1/tokens/sip10s/',
];

describe('shouldRecord', () => {
  test('records only errors at the error level', () => {
    expect(['error', 'warning', 'log'].map(type => shouldRecord(type, 'error'))).toEqual([
      true,
      false,
      false,
    ]);
  });

  test('records warnings and errors at the warning level', () => {
    expect(['error', 'warning', 'log'].map(type => shouldRecord(type, 'warning'))).toEqual([
      true,
      true,
      false,
    ]);
  });

  test('records everything at the all level', () => {
    expect(['error', 'warning', 'log', 'debug'].map(type => shouldRecord(type, 'all'))).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });
});

describe('allowlistHaystack', () => {
  test('joins a console message with its source url', () => {
    expect(allowlistHaystack(entries[5])).toBe(`${resourceFailure} ${tokenLocation.url}`);
  });

  test('joins a page error name with its message', () => {
    expect(allowlistHaystack(entries[6])).toBe('TypeError: x is not a function');
  });
});

describe('isAllowlisted', () => {
  test('matches on substrings only', () => {
    expect(isAllowlisted('prefix known noise suffix', allowlist)).toBe(true);
    expect(isAllowlisted('known', allowlist)).toBe(false);
  });

  test('never matches against an empty allowlist', () => {
    expect(isAllowlisted('known noise', [])).toBe(false);
  });
});

describe('summarizeConsole', () => {
  test('counts errors, warnings, logs and allowlisted errors separately', () => {
    expect(summarizeConsole(entries, allowlist)).toEqual({
      error: 1,
      warning: 1,
      log: 2,
      allowlisted: 2,
    });
  });
});

describe('findBlockingErrors', () => {
  test('returns the console and page errors that are not allowlisted', () => {
    const blocking = findBlockingErrors(entries, allowlist);
    expect(blocking.consoleErrors.map(entry => entry.text)).toEqual(['real failure']);
    expect(blocking.pageErrors.map(entry => entry.message)).toEqual(['x is not a function']);
  });

  test('keeps a 404 from another endpoint blocking', () => {
    const otherEndpoint: ConsoleRecord = {
      ts: '2026-10-22T10:00:07.000Z',
      type: 'error',
      text: resourceFailure,
      location: { ...tokenLocation, url: 'https://staging.api.leather.io/v1/market/prices' },
    };
    expect(findBlockingErrors([otherEndpoint], allowlist).consoleErrors).toHaveLength(1);
  });

  test('allowlists page errors by message', () => {
    expect(findBlockingErrors(entries, ['x is not a function']).pageErrors).toHaveLength(0);
  });
});

describe('listPageErrors', () => {
  test('keeps only page errors', () => {
    expect(listPageErrors(entries).map(entry => entry.name)).toEqual(['TypeError']);
  });
});
