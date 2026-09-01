import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode } from '@leather.io/rpc';

import { stxSignMessageHandler } from './sign-stacks-message';

type StxSignMessageRequest = Parameters<(typeof stxSignMessageHandler)[1]>[0];

const mocks = vi.hoisted(() => ({
  createConnectingAppSearchParamsWithLastKnownAccount: vi.fn(),
  triggerRequestPopupWindowOpen: vi.fn(),
  sendErrorResponseOnUserPopupClose: vi.fn(),
  trackRpcRequestError: vi.fn(),
  trackRpcRequestSuccess: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('../rpc-message-handler', () => ({
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

function makeRequest(params: Record<string, unknown>): StxSignMessageRequest {
  const request: unknown = {
    jsonrpc: '2.0',
    id: 'req-1',
    method: 'stx_signMessage',
    params,
  };
  return request as StxSignMessageRequest;
}

function buildPort() {
  const port: unknown = {
    sender: { frameId, url: requestingOrigin, tab: { id: tabId } },
  };
  return port as chrome.runtime.Port;
}

function invokeHandler(request: StxSignMessageRequest) {
  const [, handler] = stxSignMessageHandler;
  return handler(request, buildPort());
}

describe('stxSignMessageHandler', () => {
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
    await invokeHandler(makeRequest({ message: signInMessage('https://app.leather.io') }));

    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        error: expect.objectContaining({ code: RpcErrorCode.PERMISSION_DENIED }),
      }),
      { frameId }
    );
    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
  });

  test('opens the popup for a sign-in message naming the requesting origin', async () => {
    await invokeHandler(makeRequest({ message: signInMessage(requestingOrigin) }));

    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalled();
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalled();
  });
});
