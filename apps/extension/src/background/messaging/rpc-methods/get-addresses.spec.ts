import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getAddressesHandler, stxGetAddressesHandler } from './get-addresses';

type GetAddressesRequest = Parameters<(typeof getAddressesHandler)[1]>[0];
type StxGetAddressesRequest = Parameters<(typeof stxGetAddressesHandler)[1]>[0];

const mocks = vi.hoisted(() => ({
  createConnectingAppSearchParamsWithLastKnownAccount: vi.fn(),
  triggerRequestPopupWindowOpen: vi.fn(),
  sendErrorResponseOnUserPopupClose: vi.fn(),
  trackRpcRequestSuccess: vi.fn(),
  validateRequestNetwork: vi.fn(),
}));

vi.mock('../rpc-message-handler', () => ({
  defineRpcRequestHandler: (method: string, handler: unknown) => [method, handler],
}));

vi.mock('../rpc-request-utils', () => ({
  createConnectingAppSearchParamsWithLastKnownAccount:
    mocks.createConnectingAppSearchParamsWithLastKnownAccount,
  triggerRequestPopupWindowOpen: mocks.triggerRequestPopupWindowOpen,
  sendErrorResponseOnUserPopupClose: mocks.sendErrorResponseOnUserPopupClose,
  validateRequestNetwork: mocks.validateRequestNetwork,
}));

vi.mock('../rpc-helpers', () => ({
  trackRpcRequestSuccess: mocks.trackRpcRequestSuccess,
}));

const frameId = 42;
const tabId = 7;

function buildPort() {
  return {
    sender: { frameId, url: 'https://app.example.com', tab: { id: tabId } },
  } as unknown as chrome.runtime.Port;
}

function buildRequest(method: string, params?: Record<string, unknown>) {
  return { jsonrpc: '2.0', id: 'req-1', method, ...(params ? { params } : {}) };
}

describe('sharedGetAddressesHandler', () => {
  beforeEach(() => {
    mocks.createConnectingAppSearchParamsWithLastKnownAccount.mockResolvedValue({
      frameId,
      urlParams: new URLSearchParams(),
      tabId,
    });
    mocks.triggerRequestPopupWindowOpen.mockResolvedValue({ id: 1 });
    mocks.validateRequestNetwork.mockResolvedValue({ status: 'success' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('pins the last known account from the origin permission', async () => {
    const [, handler] = getAddressesHandler;
    await handler(buildRequest('getAddresses') as unknown as GetAddressesRequest, buildPort());

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledTimes(1);
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalledTimes(1);
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalledTimes(1);
  });

  test('passes an undefined network when the request omits network', async () => {
    const [, handler] = getAddressesHandler;
    await handler(buildRequest('getAddresses') as unknown as GetAddressesRequest, buildPort());

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { network: undefined }
    );
  });

  test('passes through the requested network param', async () => {
    const [, handler] = getAddressesHandler;
    await handler(
      buildRequest('getAddresses', { network: 'testnet' }) as unknown as GetAddressesRequest,
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

    const [, handler] = getAddressesHandler;
    await handler(
      buildRequest('getAddresses', { network: 'mocknet' }) as unknown as GetAddressesRequest,
      buildPort()
    );

    expect(mocks.validateRequestNetwork).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'mocknet' })
    );
    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).not.toHaveBeenCalled();
    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
  });

  test('handles stx_getAddresses identically', async () => {
    const [, handler] = stxGetAddressesHandler;
    await handler(
      buildRequest('stx_getAddresses') as unknown as StxGetAddressesRequest,
      buildPort()
    );

    expect(mocks.createConnectingAppSearchParamsWithLastKnownAccount).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { network: undefined }
    );
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalledTimes(1);
  });
});
