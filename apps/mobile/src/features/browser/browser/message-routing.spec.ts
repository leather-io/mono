import { describe, expect, test } from 'vitest';

import { getVerifiedMessageOrigin, resolveBrowserRpcRequest } from './message-routing';

const topOrigin = 'https://app.example.com';

function makeRequest(method: string, params?: unknown) {
  return JSON.stringify({ jsonrpc: '2.0', id: 'test-id', method, params });
}

describe('getVerifiedMessageOrigin', () => {
  test('returns the origin for a main-frame url matching the top-frame origin', () => {
    expect(getVerifiedMessageOrigin('https://app.example.com/path?q=1', topOrigin)).toBe(topOrigin);
  });

  test('allows a same-origin subframe (identical security principal)', () => {
    expect(getVerifiedMessageOrigin('https://app.example.com/embed/iframe', topOrigin)).toBe(
      topOrigin
    );
  });

  test('rejects a cross-origin subframe', () => {
    expect(getVerifiedMessageOrigin('https://widgets.other.com/frame', topOrigin)).toBeNull();
  });

  test('rejects a look-alike suffix host', () => {
    expect(getVerifiedMessageOrigin('https://app.example.com.evil.com/x', topOrigin)).toBeNull();
  });

  test('rejects a url with embedded userinfo pointing at another host', () => {
    expect(getVerifiedMessageOrigin('https://app.example.com@evil.com/x', topOrigin)).toBeNull();
  });

  test('rejects a different port', () => {
    expect(getVerifiedMessageOrigin('https://app.example.com:8443/x', topOrigin)).toBeNull();
  });

  test('rejects a different scheme', () => {
    expect(getVerifiedMessageOrigin('http://app.example.com/x', topOrigin)).toBeNull();
  });

  test('rejects non-web protocols', () => {
    expect(getVerifiedMessageOrigin('about:blank', topOrigin)).toBeNull();
    expect(getVerifiedMessageOrigin('data:text/html,<h1>hi</h1>', topOrigin)).toBeNull();
  });

  test('returns null without throwing for an invalid or empty url', () => {
    expect(getVerifiedMessageOrigin('not a url', topOrigin)).toBeNull();
    expect(getVerifiedMessageOrigin('', topOrigin)).toBeNull();
  });

  test('rejects when the top-frame origin is null', () => {
    expect(getVerifiedMessageOrigin('https://app.example.com/x', null)).toBeNull();
  });
});

describe('resolveBrowserRpcRequest', () => {
  const sendTransfer = makeRequest('sendTransfer', {
    recipients: [{ address: 'bc1qattackerreceiveaddrxxxxxxxxxxxxxxxx', amount: '0.05' }],
    network: 'mainnet',
  });
  const callContract = makeRequest('stx_callContract', {
    contract: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.evil',
    functionName: 'drain',
    network: 'mainnet',
  });

  test('drops a cross-origin subframe authority request before parsing or presenting', () => {
    expect(
      resolveBrowserRpcRequest({
        data: sendTransfer,
        frameUrl: 'https://ads.evil.example/widget',
        topFrameOrigin: topOrigin,
      })
    ).toEqual({ type: 'drop' });

    expect(
      resolveBrowserRpcRequest({
        data: callContract,
        frameUrl: 'https://ads.evil.example/widget',
        topFrameOrigin: topOrigin,
      })
    ).toEqual({ type: 'drop' });
  });

  test('presents a main-frame authority request attributed to the frame origin', () => {
    const action = resolveBrowserRpcRequest({
      data: sendTransfer,
      frameUrl: 'https://app.example.com/',
      topFrameOrigin: topOrigin,
    });
    expect(action.type).toBe('present');
    if (action.type === 'present') {
      expect(action.origin).toBe(topOrigin);
      expect(action.request.method).toBe('sendTransfer');
    }
  });

  test('auto-answers getInfo and supportedMethods for the main frame', () => {
    expect(
      resolveBrowserRpcRequest({
        data: makeRequest('getInfo'),
        frameUrl: 'https://app.example.com/',
        topFrameOrigin: topOrigin,
      }).type
    ).toBe('get-info');

    expect(
      resolveBrowserRpcRequest({
        data: makeRequest('supportedMethods'),
        frameUrl: 'https://app.example.com/',
        topFrameOrigin: topOrigin,
      }).type
    ).toBe('supported-methods');
  });

  test('drops getInfo from a cross-origin subframe', () => {
    expect(
      resolveBrowserRpcRequest({
        data: makeRequest('getInfo'),
        frameUrl: 'https://ads.evil.example/widget',
        topFrameOrigin: topOrigin,
      })
    ).toEqual({ type: 'drop' });
  });

  test('drops a malformed json payload without throwing', () => {
    expect(
      resolveBrowserRpcRequest({
        data: 'not-json',
        frameUrl: 'https://app.example.com/',
        topFrameOrigin: topOrigin,
      })
    ).toEqual({ type: 'drop' });
  });
});
