import {
  type NetworkRecord,
  classifyFailure,
  classifyResponse,
  summarizeNetwork,
} from './network-evidence';

const serverAddress = { ipAddress: '104.18.0.1', port: 443 };

function makeRecord(overrides: Partial<NetworkRecord>): NetworkRecord {
  return {
    ts: '2026-10-22T10:00:00.000Z',
    url: 'https://api.hiro.so/v2/info',
    method: 'GET',
    resourceType: 'fetch',
    status: 200,
    initiator: 'page',
    classification: 'mocked',
    ...overrides,
  };
}

describe('classifyResponse', () => {
  test('classifies extension and local urls by origin', () => {
    expect(classifyResponse('chrome-extension://abc/index.html', null)).toBe('extension');
    expect(classifyResponse('http://localhost:3000/', serverAddress)).toBe('local');
    expect(classifyResponse('http://127.0.0.1:3000/', serverAddress)).toBe('local');
  });

  test('treats a fulfilled route as mocked and a served response as real', () => {
    expect(classifyResponse('https://api.hiro.so/v2/info', null)).toBe('mocked');
    expect(classifyResponse('https://api.hiro.so/v2/info', serverAddress)).toBe('real');
  });

  test('leaves non-http and unparsable urls as other', () => {
    expect(classifyResponse('data:text/plain,hi', null)).toBe('other');
    expect(classifyResponse('not a url', null)).toBe('other');
  });
});

describe('classifyFailure', () => {
  test('treats an aborted http request as the hermetic fallback under default mocks', () => {
    expect(classifyFailure('https://api.hiro.so/v2/info', 'default')).toBe('fallback');
  });

  test('treats failures as failed without mocks or for local urls', () => {
    expect(classifyFailure('https://api.hiro.so/v2/info', 'none')).toBe('failed');
    expect(classifyFailure('http://localhost:3000/', 'default')).toBe('failed');
  });
});

describe('summarizeNetwork', () => {
  test('counts classifications, service worker requests and deduplicates real urls', () => {
    const records = [
      makeRecord({ classification: 'mocked' }),
      makeRecord({
        classification: 'real',
        url: 'https://x.example/a',
        initiator: 'service-worker',
      }),
      makeRecord({ classification: 'real', url: 'https://x.example/a' }),
      makeRecord({ classification: 'fallback', status: null }),
    ];
    expect(summarizeNetwork(records, 'observed')).toEqual({
      counts: { extension: 0, local: 0, mocked: 1, fallback: 1, real: 2, failed: 0, other: 0 },
      serviceWorkerRequests: 1,
      realUrls: ['https://x.example/a'],
      background: 'observed',
    });
  });
});
