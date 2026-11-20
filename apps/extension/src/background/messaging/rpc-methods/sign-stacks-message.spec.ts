import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode } from '@leather.io/rpc';

import { createMockPort } from '../create-mock-port';
import { stxSignMessageHandler, stxSignStructuredMessageHandler } from './sign-stacks-message';

type StxSignMessageRequest = Parameters<(typeof stxSignMessageHandler)[1]>[0];
type StxSignStructuredMessageRequest = Parameters<(typeof stxSignStructuredMessageHandler)[1]>[0];

const mocks = vi.hoisted(() => ({
  createConnectingAppSearchParamsWithLastKnownAccount:
    vi.fn<
      (
        port: chrome.runtime.Port,
        otherParams: [string, string][],
        networkParam?: { network: string | undefined }
      ) => Promise<{ frameId: number; urlParams: URLSearchParams; tabId: number }>
    >(),
  triggerRequestPopupWindowOpen: vi.fn(),
  sendErrorResponseOnUserPopupClose: vi.fn(),
  trackRpcRequestError: vi.fn(),
  trackRpcRequestSuccess: vi.fn(),
  sendMessage: vi.fn(),
  validateRequestNetwork: vi.fn(),
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
  validateRequestNetwork: mocks.validateRequestNetwork,
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

function makeRequest(params: StxSignMessageRequest['params']): StxSignMessageRequest {
  return {
    jsonrpc: '2.0',
    id: 'req-1',
    method: 'stx_signMessage',
    params,
  };
}

function buildPort() {
  return createMockPort({ frameId, url: requestingOrigin, tab: { id: tabId } });
}

function invokeHandler(request: StxSignMessageRequest) {
  const [, handler] = stxSignMessageHandler;
  return handler(request, buildPort());
}

function objectContaining(expected: Record<string, unknown>): unknown {
  return expect.objectContaining(expected);
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
    mocks.validateRequestNetwork.mockResolvedValue({ status: 'success' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('responds with INVALID_REQUEST when params are undefined', async () => {
    const [, handler] = stxSignMessageHandler;
    const requestWithoutParams = makeRequest({ message: 'hello', messageType: 'utf8' });
    Reflect.deleteProperty(requestWithoutParams, 'params');
    await handler(requestWithoutParams, buildPort());

    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        id: 'req-1',
        error: objectContaining({ code: RpcErrorCode.INVALID_REQUEST }),
      }),
      { frameId }
    );
  });

  test('opens the signature popup for a valid request', async () => {
    const [, handler] = stxSignMessageHandler;
    const params = {
      message: 'hello',
      messageType: 'utf8',
      network: 'testnet',
    } satisfies StxSignMessageRequest['params'];
    Reflect.deleteProperty(params, 'messageType');
    await handler({ jsonrpc: '2.0', id: 'req-2', method: 'stx_signMessage', params }, buildPort());

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        ['message', 'hello'],
        ['messageType', 'utf8'],
      ]),
      { network: 'testnet' }
    );
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalledTimes(1);
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalledTimes(1);
  });

  test('refuses a sign-in message naming a different origin before opening the popup', async () => {
    await invokeHandler(
      makeRequest({ message: signInMessage('https://app.leather.io'), messageType: 'utf8' })
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
      makeRequest({ message: signInMessage(requestingOrigin), messageType: 'utf8' })
    );

    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalled();
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalled();
  });
});

describe('stxSignStructuredMessageHandler', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', { tabs: { sendMessage: mocks.sendMessage } });
    mocks.createConnectingAppSearchParamsWithLastKnownAccount.mockResolvedValue({
      frameId,
      urlParams: new URLSearchParams(),
      tabId,
    });
    mocks.triggerRequestPopupWindowOpen.mockResolvedValue({ id: 1 });
    mocks.validateRequestNetwork.mockResolvedValue({ status: 'success' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('responds with INVALID_REQUEST when params are undefined', async () => {
    const [, handler] = stxSignStructuredMessageHandler;
    const requestWithoutParams: StxSignStructuredMessageRequest = {
      jsonrpc: '2.0',
      id: 'req-3',
      method: 'stx_signStructuredMessage',
      params: { message: '0c00000001', domain: '0c00000002' },
    };
    Reflect.deleteProperty(requestWithoutParams, 'params');
    await handler(requestWithoutParams, buildPort());

    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        id: 'req-3',
        error: objectContaining({ code: RpcErrorCode.INVALID_REQUEST }),
      }),
      { frameId }
    );
  });

  test('opens the signature popup for a valid request', async () => {
    const [, handler] = stxSignStructuredMessageHandler;
    await handler(
      {
        jsonrpc: '2.0',
        id: 'req-4',
        method: 'stx_signStructuredMessage',
        params: { message: '0c00000001', domain: '0c00000002', network: 'mainnet' },
      },
      buildPort()
    );

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        ['messageType', 'structured'],
        ['message', '0c00000001'],
        ['domain', '0c00000002'],
      ]),
      { network: 'mainnet' }
    );
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalledTimes(1);
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalledTimes(1);
  });
});
