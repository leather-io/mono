import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode } from '@leather.io/rpc';

import { createMockPort } from '../create-mock-port';
import { sendTransferHandler } from './send-transfer';

type SendTransferRequest = Parameters<(typeof sendTransferHandler)[1]>[0];

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

const request: SendTransferRequest = {
  jsonrpc: '2.0',
  id: 'req-1',
  method: 'sendTransfer',
  params: {
    recipients: [{ address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: '10000' }],
    network: 'mainnet',
  },
};

function buildPort() {
  return createMockPort({ frameId, url: 'https://app.example.com', tab: { id: tabId } });
}

function buildRequestWithoutParams(): SendTransferRequest {
  const requestWithoutParams: SendTransferRequest = { ...request, id: 'req-2' };
  Reflect.deleteProperty(requestWithoutParams, 'params');
  return requestWithoutParams;
}

function invokeHandler(port: chrome.runtime.Port) {
  const [, handler] = sendTransferHandler;
  return handler(request, port);
}

function objectContaining(expected: Record<string, unknown>): unknown {
  return expect.objectContaining(expected);
}

describe('sendTransferHandler', () => {
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

  test('opens the send-transfer popup for a valid request', async () => {
    await invokeHandler(buildPort());

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledTimes(1);
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalledTimes(1);
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalledTimes(1);
  });

  test('forwards an explicit account 0 as a request-scoped account', async () => {
    const [, handler] = sendTransferHandler;
    await handler(
      {
        jsonrpc: '2.0',
        id: 'req-6',
        method: 'sendTransfer',
        params: {
          recipients: [{ address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: '10000' }],
          network: 'mainnet',
          account: 0,
        },
      },
      buildPort()
    );

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([['accountIndex', '0']]),
      { network: 'mainnet' }
    );
  });

  test('passes an undefined network when the request omits network', async () => {
    const [, handler] = sendTransferHandler;
    const params = {
      recipients: [{ address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: '10000' }],
      network: 'mainnet',
    };
    Reflect.deleteProperty(params, 'network');
    await handler({ jsonrpc: '2.0', id: 'req-3', method: 'sendTransfer', params }, buildPort());

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { network: undefined }
    );
  });

  test('passes through the requested network param', async () => {
    const [, handler] = sendTransferHandler;
    await handler(
      {
        jsonrpc: '2.0',
        id: 'req-4',
        method: 'sendTransfer',
        params: {
          recipients: [{ address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', amount: '10000' }],
          network: 'testnet',
        },
      },
      buildPort()
    );

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { network: 'testnet' }
    );
  });

  test('rejects unknown network values before opening the popup', async () => {
    mocks.validateRequestNetwork.mockResolvedValue({ status: 'failure' });

    const [, handler] = sendTransferHandler;
    await handler(
      {
        jsonrpc: '2.0',
        id: 'req-5',
        method: 'sendTransfer',
        params: {
          recipients: [{ address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: '10000' }],
          network: 'Testnet',
        },
      },
      buildPort()
    );

    expect(mocks.validateRequestNetwork).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'Testnet' })
    );
    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).not.toHaveBeenCalled();
    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
  });

  test('rejects undefined parameters', async () => {
    const [, handler] = sendTransferHandler;
    await handler(buildRequestWithoutParams(), buildPort());

    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        error: objectContaining({ code: RpcErrorCode.INVALID_REQUEST }),
      }),
      { frameId }
    );
  });
});
