import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode } from '@leather.io/rpc';

import { stxSignMessageHandler, stxSignStructuredMessageHandler } from './sign-stacks-message';

type StxSignMessageRequest = Parameters<(typeof stxSignMessageHandler)[1]>[0];
type StxSignStructuredMessageRequest = Parameters<(typeof stxSignStructuredMessageHandler)[1]>[0];

const mocks = vi.hoisted(() => ({
  createConnectingAppSearchParamsWithLastKnownAccount: vi.fn(),
  triggerRequestPopupWindowOpen: vi.fn(),
  sendErrorResponseOnUserPopupClose: vi.fn(),
  trackRpcRequestError: vi.fn(),
  trackRpcRequestSuccess: vi.fn(),
  sendMessage: vi.fn(),
  validateRequestNetwork: vi.fn(),
}));

vi.mock('../rpc-message-handler', () => ({
  defineRpcRequestHandler: (method: string, handler: unknown) => [method, handler],
}));

vi.mock('../rpc-request-utils', () => ({
  getOriginatingFrameFromPort: (port: chrome.runtime.Port) => ({
    frameId: port.sender?.frameId ?? 0,
    tabId: port.sender?.tab?.id ?? 0,
  }),
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

function buildPort() {
  return {
    sender: { frameId, url: 'https://app.example.com', tab: { id: tabId } },
  } as unknown as chrome.runtime.Port;
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
    await handler(
      {
        jsonrpc: '2.0',
        id: 'req-1',
        method: 'stx_signMessage',
      } as unknown as StxSignMessageRequest,
      buildPort()
    );

    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        id: 'req-1',
        error: expect.objectContaining({ code: RpcErrorCode.INVALID_REQUEST }),
      }),
      { frameId }
    );
  });

  test('opens the signature popup for a valid request', async () => {
    const [, handler] = stxSignMessageHandler;
    await handler(
      {
        jsonrpc: '2.0',
        id: 'req-2',
        method: 'stx_signMessage',
        params: { message: 'hello', network: 'testnet' },
      } as unknown as StxSignMessageRequest,
      buildPort()
    );

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
    await handler(
      {
        jsonrpc: '2.0',
        id: 'req-3',
        method: 'stx_signStructuredMessage',
      } as unknown as StxSignStructuredMessageRequest,
      buildPort()
    );

    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        id: 'req-3',
        error: expect.objectContaining({ code: RpcErrorCode.INVALID_REQUEST }),
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
      } as unknown as StxSignStructuredMessageRequest,
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
