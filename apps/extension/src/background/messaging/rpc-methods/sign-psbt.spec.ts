import { bytesToHex } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode } from '@leather.io/rpc';

import { signPsbtHandler } from './sign-psbt';

type SignPsbtRequest = Parameters<(typeof signPsbtHandler)[1]>[0];

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

function makePsbtHex() {
  const tx = new btc.Transaction();
  tx.addInput({
    txid: new Uint8Array(32).fill(0x11),
    index: 0,
  });
  return bytesToHex(tx.toPSBT());
}

const bondDescriptor = 'wsh(and_v(v:after(1000),multi(1,unimportant)))';

function makeRequest(params: Record<string, unknown>): SignPsbtRequest {
  const request: unknown = {
    jsonrpc: '2.0',
    id: 'req-1',
    method: 'signPsbt',
    params,
  };
  return request as SignPsbtRequest;
}

function buildPort() {
  const port: unknown = {
    sender: { frameId, url: 'https://app.example.com', tab: { id: tabId } },
  };
  return port as chrome.runtime.Port;
}

function invokeHandler(request: SignPsbtRequest) {
  const [, handler] = signPsbtHandler;
  return handler(request, buildPort());
}

describe('signPsbtHandler', () => {
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

  test('rejects propose without a descriptor before opening the popup', async () => {
    await invokeHandler(makeRequest({ hex: makePsbtHex(), propose: true }));

    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        error: expect.objectContaining({
          code: RpcErrorCode.INVALID_PARAMS,
          message: 'Proposing a transaction requires a descriptor',
        }),
      }),
      { frameId }
    );
    expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
  });

  test('forwards the propose flag and descriptor into the popup params', async () => {
    await invokeHandler(
      makeRequest({ hex: makePsbtHex(), propose: true, descriptor: bondDescriptor })
    );

    const requestParams: [string, string][] =
      mocks.createConnectingAppSearchParamsWithLastKnownAccount.mock.calls[0][1];
    expect(requestParams).toEqual(
      expect.arrayContaining([
        ['propose', 'true'],
        ['descriptor', bondDescriptor],
      ])
    );
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalled();
    expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalled();
  });

  test('opens the popup without a propose param when not proposing', async () => {
    await invokeHandler(makeRequest({ hex: makePsbtHex() }));

    const requestParams: [string, string][] =
      mocks.createConnectingAppSearchParamsWithLastKnownAccount.mock.calls[0][1];
    expect(requestParams.map(([key]) => key)).not.toContain('propose');
    expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalled();
  });
});
