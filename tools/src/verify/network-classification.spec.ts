import { describe, expect, test } from 'vitest';

import {
  type NetworkRecord,
  cancelledByPageError,
  classifyFailure,
  classifyResponse,
  summarizeNetwork,
} from './network-classification.js';

const serverAddress = { ipAddress: '104.18.0.1', port: 443 };

function record(overrides: Partial<NetworkRecord>): NetworkRecord {
  return {
    url: 'https://api.hiro.so/v2/info',
    method: 'GET',
    resourceType: 'fetch',
    initiator: 'page',
    classification: 'mocked',
    status: 200,
    at: 1,
    ...overrides,
  };
}

describe(classifyResponse.name, () => {
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

describe(classifyFailure.name, () => {
  test('treats an aborted remote request as the hermetic fallback only under mocks', () => {
    expect(classifyFailure('https://api.hiro.so/v2/info', 'net::ERR_FAILED', true)).toBe(
      'fallback'
    );
    expect(classifyFailure('https://api.hiro.so/v2/info', 'net::ERR_FAILED', false)).toBe('failed');
  });

  test('treats page-cancelled, local and non-http failures as failed', () => {
    expect(classifyFailure('https://api.hiro.so/v2/info', cancelledByPageError, true)).toBe(
      'failed'
    );
    expect(classifyFailure('http://localhost:3000/', 'net::ERR_FAILED', true)).toBe('failed');
    expect(classifyFailure('data:text/plain,hi', undefined, true)).toBe('failed');
    expect(classifyFailure('not a url', undefined, true)).toBe('other');
  });
});

describe(summarizeNetwork.name, () => {
  const records = [
    record({ classification: 'mocked' }),
    record({ classification: 'real', url: 'https://x.example/a', initiator: 'service-worker' }),
    record({ classification: 'real', url: 'https://x.example/a' }),
    record({ classification: 'fallback', status: null }),
    record({ classification: 'extension', url: 'chrome-extension://abc/index.html' }),
  ];

  test('counts classifications, service-worker requests and deduplicates real urls', () => {
    expect(summarizeNetwork(records, true)).toEqual({
      total: 5,
      counts: { extension: 1, local: 0, mocked: 1, fallback: 1, real: 2, failed: 0, other: 0 },
      serviceWorkerRequests: 1,
      realUrls: ['GET https://x.example/a'],
      blockingReal: 2,
    });
  });

  test('reports real requests without blocking when the run is not hermetic', () => {
    expect(summarizeNetwork(records, false).blockingReal).toBe(0);
  });
});
