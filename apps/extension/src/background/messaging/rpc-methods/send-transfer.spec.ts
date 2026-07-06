import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode } from '@leather.io/rpc';

import { sendTransferHandler } from './send-transfer';

type SendTransferRequest = Parameters<(typeof sendTransferHandler)[1]>[0];

const mocks = vi.hoisted(() => ({
  validateActivePolicyChain: vi.fn(),
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
  validateActivePolicyChain: mocks.validateActivePolicyChain,
  getTabIdFromPort: (port: chrome.runtime.Port) => port.sender?.tab?.id ?? 0,
  createConnectingAppSearchParamsWithLastKnownAccount:
    mocks.createConnectingAppSearchParamsWithLastKnownAccount,
  triggerRequestPopupWindowOpen: mocks.triggerRequestPopupWindowOpen,
  sendErrorResponseOnUserPopupClose: mocks.sendErrorResponseOnUserPopupClose,
}));

vi.mock('../rpc-helpers', () => ({
  trackRpcRequestError: mocks.trackRpcRequestError,
  trackRpcRequestSuccess: mocks.trackRpcRequestSuccess,
}));

const tabId = 7;

const request = {
  jsonrpc: '2.0',
  id: 'req-1',
  method: 'sendTransfer',
  params: {
    recipients: [{ address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: '10000' }],
    network: 'mainnet',
  },
} as unknown as SendTransferRequest;

function buildPort() {
  return {
    sender: { url: 'https://app.example.com', tab: { id: tabId } },
  } as unknown as chrome.runtime.Port;
}

function invokeHandler(port: chrome.runtime.Port) {
  const [, handler] = sendTransferHandler;
  return handler(request, port);
}

describe('sendTransferHandler', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', { tabs: { sendMessage: mocks.sendMessage } });
    mocks.createConnectingAppSearchParamsWithLastKnownAccount.mockResolvedValue({
      urlParams: new URLSearchParams(),
      tabId,
    });
    mocks.triggerRequestPopupWindowOpen.mockResolvedValue({ id: 1 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('validates the active policy is on the Bitcoin chain before doing anything else', async () => {
    mocks.validateActivePolicyChain.mockResolvedValue({ status: 'success' });

    await invokeHandler(buildPort());

    expect(mocks.validateActivePolicyChain).toHaveBeenCalledWith(
      request,
      expect.anything(),
      'bitcoin'
    );
  });

  test('short-circuits without opening a popup when the policy chain check fails', async () => {
    mocks.validateActivePolicyChain.mockResolvedValue({ status: 'failure' });

    await invokeHandler(buildPort());

    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).not.toHaveBeenCalled();
    expect(mocks.trackRpcRequestSuccess).not.toHaveBeenCalled();
  });

  test('opens the send-transfer popup when the policy chain check passes', async () => {
    mocks.validateActivePolicyChain.mockResolvedValue({ status: 'success' });

    await invokeHandler(buildPort());

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledTimes(1);
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalledTimes(1);
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalledTimes(1);
  });

  test('rejects undefined parameters after passing the policy check', async () => {
    mocks.validateActivePolicyChain.mockResolvedValue({ status: 'success' });

    const [, handler] = sendTransferHandler;
    await handler(
      { jsonrpc: '2.0', id: 'req-2', method: 'sendTransfer' } as unknown as SendTransferRequest,
      buildPort()
    );

    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        error: expect.objectContaining({ code: RpcErrorCode.INVALID_REQUEST }),
      })
    );
  });
});
