import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { instantiateBondDescriptor, makeNativeSegwitAccountXpub } from '@leather.io/bitcoin';
import { RpcErrorCode } from '@leather.io/rpc';

import { RouteUrls } from '@shared/route-urls';

import { btcAddAccountHandler } from './btc-add-account';

type BtcAddAccountRequest = Parameters<(typeof btcAddAccountHandler)[1]>[0];

const mocks = vi.hoisted(() => ({
  frameId: 42,
  tabId: 7,
  createConnectingAppMetadataSearchParams: vi.fn(),
  triggerRequestPopupWindowOpen: vi.fn(),
  sendErrorResponseOnUserPopupClose: vi.fn(),
  validateRequestParams: vi.fn(),
  trackRpcRequestError: vi.fn(),
  trackRpcRequestSuccess: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('../rpc-message-handler', () => ({
  defineRpcRequestHandler: (method: string, handler: unknown) => [method, handler],
}));

vi.mock('../rpc-request-utils', () => ({
  getOriginatingFrameFromPort: () => ({ frameId: mocks.frameId, tabId: mocks.tabId }),
  createConnectingAppMetadataSearchParams: mocks.createConnectingAppMetadataSearchParams,
  triggerRequestPopupWindowOpen: mocks.triggerRequestPopupWindowOpen,
  sendErrorResponseOnUserPopupClose: mocks.sendErrorResponseOnUserPopupClose,
  validateRequestParams: mocks.validateRequestParams,
}));

vi.mock('../rpc-helpers', () => ({
  trackRpcRequestError: mocks.trackRpcRequestError,
  trackRpcRequestSuccess: mocks.trackRpcRequestSuccess,
}));

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const counterpartyXpub = makeNativeSegwitAccountXpub(9);
const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
const unlockHeight = 1000;
const vaultKeys = { threshold: 2, keyExpressions: [`${xpubA}/0/0`, `${xpubB}/0/0`] };

const multisigDescriptor = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`;
const bondDescriptor = instantiateBondDescriptor({
  unlockHeight,
  hash,
  counterpartyKey: `${counterpartyXpub}/0/0`,
  ...vaultKeys,
});
const singleSignerBondDescriptor = `wsh(and_v(v:or_i(after(${unlockHeight}),and_v(v:sha256(${hash}),pk(${counterpartyXpub}/0/0))),pk(${xpubA}/0/0)))`;
const mismatchedIndexBondDescriptor = instantiateBondDescriptor({
  unlockHeight,
  hash,
  counterpartyKey: `${counterpartyXpub}/0/1`,
  ...vaultKeys,
});
const nonBondMiniscriptDescriptor = `wsh(and_v(v:after(${unlockHeight}),pk(${xpubA}/0/0)))`;
const nativeSegwitDescriptor = `wpkh(${xpubA}/0/0)`;
const originPrefixedMultisigDescriptor = `wsh(multi(2,[aabbccdd/84'/0'/0']${xpubA}/0/0,${xpubB}/0/0))`;
const multiLeafMiniscriptDescriptor = `wsh(or_d(multi(2,${xpubA}/0/0,${xpubB}/0/0),pk(${counterpartyXpub}/0/0)))`;
const timelockedMultiDescriptor = `wsh(and_v(v:after(${unlockHeight}),multi(2,${xpubA}/0/0,${xpubB}/0/0)))`;
const rangedMultisigDescriptor = `wsh(sortedmulti(2,${xpubA}/0/*,${xpubB}/0/*))`;

const unsupportedDescriptorMessage = 'Only multisig or timelocked wsh() descriptors are supported';

function makeRequest(descriptor: string): BtcAddAccountRequest {
  return {
    jsonrpc: '2.0',
    id: 'req-1',
    method: 'btc_addAccount',
    params: { descriptor, name: 'Vault' },
  };
}

function invokeHandler(descriptor: string) {
  const port: chrome.runtime.Port = Object.create(null);
  const [, handler] = btcAddAccountHandler;
  return handler(makeRequest(descriptor), port);
}

function expectPopupOpened() {
  expect(mocks.sendMessage).not.toHaveBeenCalled();
  expect(mocks.triggerRequestPopupWindowOpen).toHaveBeenCalledWith(
    RouteUrls.RpcBtcAddAccount,
    expect.any(URLSearchParams)
  );
  expect(mocks.sendErrorResponseOnUserPopupClose).toHaveBeenCalled();
}

function expectRejectedAsUnsupported() {
  expect(mocks.sendMessage).toHaveBeenCalledWith(
    mocks.tabId,
    expect.objectContaining({
      error: expect.objectContaining({
        code: RpcErrorCode.INVALID_PARAMS,
        message: unsupportedDescriptorMessage,
      }),
    }),
    { frameId: mocks.frameId }
  );
  expect(mocks.triggerRequestPopupWindowOpen).not.toHaveBeenCalled();
}

describe('btcAddAccountHandler', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', { tabs: { sendMessage: mocks.sendMessage } });
    mocks.validateRequestParams.mockReturnValue({ status: 'success' });
    mocks.createConnectingAppMetadataSearchParams.mockReturnValue({
      frameId: mocks.frameId,
      urlParams: new URLSearchParams(),
      tabId: mocks.tabId,
    });
    mocks.triggerRequestPopupWindowOpen.mockResolvedValue({ id: 1 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('opens the popup for a multisig descriptor', async () => {
    await invokeHandler(multisigDescriptor);
    expectPopupOpened();
  });

  test('opens the popup for a bond descriptor with a multisig vault', async () => {
    await invokeHandler(bondDescriptor);
    expectPopupOpened();
  });

  test('opens the popup for a bond descriptor with a single-signer vault', async () => {
    await invokeHandler(singleSignerBondDescriptor);
    expectPopupOpened();
  });

  test('rejects a miniscript descriptor that is neither multisig nor a bond', async () => {
    await invokeHandler(nonBondMiniscriptDescriptor);
    expectRejectedAsUnsupported();
  });

  test('rejects a non-wsh descriptor', async () => {
    await invokeHandler(nativeSegwitDescriptor);
    expectRejectedAsUnsupported();
  });

  test('opens the popup for a multi descriptor with origin-prefixed keys', async () => {
    await invokeHandler(originPrefixedMultisigDescriptor);
    expectPopupOpened();
  });

  test('rejects miniscript that merely wraps a multi leaf in another spend path', async () => {
    await invokeHandler(multiLeafMiniscriptDescriptor);
    expectRejectedAsUnsupported();
  });

  test('rejects miniscript that merely wraps a multi leaf in a timelock', async () => {
    await invokeHandler(timelockedMultiDescriptor);
    expectRejectedAsUnsupported();
  });

  test('rejects a ranged multisig descriptor', async () => {
    await invokeHandler(rangedMultisigDescriptor);
    expectRejectedAsUnsupported();
  });

  test('rejects a bond whose counterparty key index differs from the vault index', async () => {
    await invokeHandler(mismatchedIndexBondDescriptor);
    expectRejectedAsUnsupported();
  });
});
