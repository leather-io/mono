import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  RpcErrorCode,
  type RpcRequests,
  getAddresses,
  open,
  sendTransfer,
  signMessage,
  signPsbt,
  stxCallContract,
  stxDeployContract,
  stxGetAddresses,
  stxSignMessage,
  stxSignStructuredMessage,
  stxSignTransaction,
  stxTransferSip9Nft,
  stxTransferSip10Ft,
  stxTransferStx,
  supportedMethods,
} from '@leather.io/rpc';

import { methodsRequiringConnectedWallet } from './methods-requiring-connected-wallet';
import { rpcMessageHandler } from './rpc-message-handler';

const mocks = vi.hoisted(() => {
  const dispatchHandler = vi.fn();
  return {
    dispatchHandler,
    defineHandler: (method: string) => [method, dispatchHandler],
    getOriginatingFrameFromPort: vi.fn(),
    listenForOriginTabClose: vi.fn(),
    sendMessageToOriginatingFrame: vi.fn(),
    validateConnectedWalletExists: vi.fn(),
  };
});

vi.mock('@shared/logger', () => ({ logger: { info: vi.fn() } }));

vi.mock('@shared/messaging/send-message-to-originating-frame', () => ({
  sendMessageToOriginatingFrame: mocks.sendMessageToOriginatingFrame,
}));

vi.mock('./rpc-request-utils', () => ({
  getOriginatingFrameFromPort: mocks.getOriginatingFrameFromPort,
  listenForOriginTabClose: mocks.listenForOriginTabClose,
  validateConnectedWalletExists: mocks.validateConnectedWalletExists,
}));

vi.mock('./rpc-methods/btc-add-account', () => ({
  btcAddAccountHandler: mocks.defineHandler('btc_addAccount'),
}));
vi.mock('./rpc-methods/get-addresses', () => ({
  getAddressesHandler: mocks.defineHandler('getAddresses'),
  stxGetAddressesHandler: mocks.defineHandler('stx_getAddresses'),
}));
vi.mock('./rpc-methods/open', () => ({ openHandler: mocks.defineHandler('open') }));
vi.mock('./rpc-methods/open-swap', () => ({ openSwapHandler: mocks.defineHandler('openSwap') }));
vi.mock('./rpc-methods/send-transfer', () => ({
  sendTransferHandler: mocks.defineHandler('sendTransfer'),
}));
vi.mock('./rpc-methods/sign-message', () => ({
  signMessageHandler: mocks.defineHandler('signMessage'),
}));
vi.mock('./rpc-methods/sign-psbt', () => ({ signPsbtHandler: mocks.defineHandler('signPsbt') }));
vi.mock('./rpc-methods/sign-stacks-message', () => ({
  stxSignMessageHandler: mocks.defineHandler('stx_signMessage'),
  stxSignStructuredMessageHandler: mocks.defineHandler('stx_signStructuredMessage'),
}));
vi.mock('./rpc-methods/stx-add-account', () => ({
  stxAddAccountHandler: mocks.defineHandler('stx_addAccount'),
}));
vi.mock('./rpc-methods/stx-call-contract', () => ({
  stxCallContractHandler: mocks.defineHandler('stx_callContract'),
}));
vi.mock('./rpc-methods/stx-deploy-contract', () => ({
  stxDeployContractHandler: mocks.defineHandler('stx_deployContract'),
}));
vi.mock('./rpc-methods/stx-sign-transaction', () => ({
  stxSignTransactionHandler: mocks.defineHandler('stx_signTransaction'),
}));
vi.mock('./rpc-methods/stx-transfer-sip9-nft', () => ({
  stxTransferSip9NftHandler: mocks.defineHandler('stx_transferSip9Nft'),
}));
vi.mock('./rpc-methods/stx-transfer-sip10-ft', () => ({
  stxTransferSip10FtHandler: mocks.defineHandler('stx_transferSip10Ft'),
}));
vi.mock('./rpc-methods/stx-transfer-stx', () => ({
  stxTransferStxHandler: mocks.defineHandler('stx_transferStx'),
}));
vi.mock('./rpc-methods/supported-methods', () => ({
  supportedMethodsHandler: mocks.defineHandler('supportedMethods'),
}));

describe('methodsRequiringConnectedWallet', () => {
  test('guards every signing and transfer method', () => {
    const guarded = [
      signPsbt,
      signMessage,
      sendTransfer,
      stxSignMessage,
      stxSignStructuredMessage,
      stxSignTransaction,
      stxCallContract,
      stxDeployContract,
      stxTransferStx,
      stxTransferSip9Nft,
      stxTransferSip10Ft,
    ];

    for (const endpoint of guarded)
      expect(methodsRequiringConnectedWallet.has(endpoint.method)).toBe(true);
  });

  test('does not guard the connect and metadata methods', () => {
    const unguarded = [getAddresses, stxGetAddresses, open, supportedMethods];

    for (const endpoint of unguarded)
      expect(methodsRequiringConnectedWallet.has(endpoint.method)).toBe(false);
  });
});

describe('rpcMessageHandler', () => {
  const originatingFrame = { frameId: 0, tabId: 7 };
  const port = { sender: { ...originatingFrame, url: 'https://evil.example' } };

  function buildRequest(method: unknown) {
    return { jsonrpc: '2.0', id: 'req-1', method, params: { hex: '70736274ff' } };
  }

  async function handleRequest(method: unknown) {
    return rpcMessageHandler(
      buildRequest(method) as RpcRequests,
      port as unknown as chrome.runtime.Port
    );
  }

  function expectRejectedAsUnknownMethod() {
    expect(mocks.dispatchHandler).not.toHaveBeenCalled();
    expect(mocks.validateConnectedWalletExists).not.toHaveBeenCalled();
    expect(mocks.sendMessageToOriginatingFrame).toHaveBeenCalledWith(
      originatingFrame,
      expect.objectContaining({
        error: expect.objectContaining({ code: RpcErrorCode.METHOD_NOT_FOUND }),
      })
    );
  }

  beforeEach(() => {
    mocks.getOriginatingFrameFromPort.mockReturnValue(originatingFrame);
    mocks.validateConnectedWalletExists.mockResolvedValue({ status: 'success' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('checks the connected wallet before dispatching a guarded method', async () => {
    await handleRequest(signPsbt.method);

    expect(mocks.validateConnectedWalletExists).toHaveBeenCalledTimes(1);
    expect(mocks.dispatchHandler).toHaveBeenCalledTimes(1);
    expect(mocks.sendMessageToOriginatingFrame).not.toHaveBeenCalled();
  });

  test('does not dispatch a guarded method once the connected wallet check fails', async () => {
    mocks.validateConnectedWalletExists.mockResolvedValue({ status: 'failure' });

    await handleRequest(signPsbt.method);

    expect(mocks.validateConnectedWalletExists).toHaveBeenCalledTimes(1);
    expect(mocks.dispatchHandler).not.toHaveBeenCalled();
  });

  test('dispatches an unguarded method without the connected wallet check', async () => {
    await handleRequest(supportedMethods.method);

    expect(mocks.validateConnectedWalletExists).not.toHaveBeenCalled();
    expect(mocks.dispatchHandler).toHaveBeenCalledTimes(1);
  });

  test('rejects a guarded method wrapped in an array', async () => {
    await handleRequest([signPsbt.method]);

    expectRejectedAsUnknownMethod();
  });

  test('rejects a guarded method boxed in an object that stringifies to it', async () => {
    await handleRequest({ toString: () => signPsbt.method });

    expectRejectedAsUnknownMethod();
  });

  test('rejects a key inherited from the object prototype', async () => {
    await handleRequest('constructor');

    expectRejectedAsUnknownMethod();
  });

  test('rejects a method that is not a string', async () => {
    await handleRequest(undefined);

    expectRejectedAsUnknownMethod();
  });
});
