import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode } from '@leather.io/rpc';

import { createMockPort } from '../create-mock-port';
import { signMessageHandler } from './sign-message';

type SignMessageRequest = Parameters<(typeof signMessageHandler)[1]>[0];

const mocks = vi.hoisted(() => ({
  createConnectingAppSearchParamsWithLastKnownAccount:
    vi.fn<
      (
        port: chrome.runtime.Port,
        otherParams: [string, string][]
      ) => Promise<{ frameId: number; urlParams: URLSearchParams; tabId: number }>
    >(),
  triggerRequestPopupWindowOpen: vi.fn(),
  sendErrorResponseOnUserPopupClose: vi.fn(),
  trackRpcRequestError: vi.fn(),
  trackRpcRequestSuccess: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('../define-rpc-request-handler', () => ({
  defineRpcRequestHandler: (method: string, handler: unknown) => [method, handler],
}));

vi.mock('../rpc-request-utils', () => ({
  getOriginatingFrameFromPort: (port: chrome.runtime.Port) => ({
    frameId: port.sender?.frameId ?? 0,
    tabId: port.sender?.tab?.id ?? 0,
  }),
  getOriginFromPort: (port: chrome.runtime.Port) =>
    port.sender?.url ? new URL(port.sender.url).origin : port.sender?.origin,
  createConnectingAppSearchParamsWithLastKnownAccount:
    mocks.createConnectingAppSearchParamsWithLastKnownAccount,
  triggerRequestPopupWindowOpen: mocks.triggerRequestPopupWindowOpen,
  sendErrorResponseOnUserPopupClose: mocks.sendErrorResponseOnUserPopupClose,
}));

vi.mock('../rpc-helpers', () => ({
  trackRpcRequestError: mocks.trackRpcRequestError,
  trackRpcRequestSuccess: mocks.trackRpcRequestSuccess,
}));

const frameId = 42;
const tabId = 7;
const requestingOrigin = 'https://app.example.com';

function signInMessage(domain: string) {
  return `Sign in to Leather\nDomain: ${domain}\nApplication: multisig\nNetwork: mainnet\nIssued: 1780651887`;
}

function makeRequest(params: SignMessageRequest['params']): SignMessageRequest {
  return {
    jsonrpc: '2.0',
    id: 'req-1',
    method: 'signMessage',
    params,
  };
}

function buildPort() {
  return createMockPort({ frameId, url: requestingOrigin, tab: { id: tabId } });
}

function invokeHandler(request: SignMessageRequest) {
  const [, handler] = signMessageHandler;
  return handler(request, buildPort());
}

function objectContaining(expected: Record<string, unknown>): unknown {
  return expect.objectContaining(expected);
}

describe('signMessageHandler', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', { tabs: { sendMessage: mocks.sendMessage } });
    mocks.createConnectingAppSearchParamsWithLastKnownAccount.mockResolvedValue({
      frameId,
      urlParams: new URLSearchParams(),
      tabId,
    });
    mocks.triggerRequestPopupWindowOpen.mockResolvedValue({ id: 1 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('refuses a sign-in message naming a different origin before opening the popup', async () => {
    await invokeHandler(
      makeRequest({ message: signInMessage('https://app.leather.io'), paymentType: 'p2wpkh' })
    );

    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        error: objectContaining({ code: RpcErrorCode.PERMISSION_DENIED }),
      }),
      { frameId }
    );
    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
  });

  test('opens the popup for a sign-in message naming the requesting origin', async () => {
    await invokeHandler(
      makeRequest({ message: signInMessage(requestingOrigin), paymentType: 'p2wpkh' })
    );

    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalled();
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalled();
  });

  test('opens the popup for an ordinary message', async () => {
    await invokeHandler(makeRequest({ message: 'gm, sign this', paymentType: 'p2wpkh' }));

    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalled();
  });
});
