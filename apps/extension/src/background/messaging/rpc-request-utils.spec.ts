import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode, type RpcRequests } from '@leather.io/rpc';

import {
  createConnectingAppSearchParamsWithLastKnownAccount,
  makeNetworkRequestParam,
  validateConnectedWalletExists,
} from './rpc-request-utils';

const mocks = vi.hoisted(() => ({
  getRootState: vi.fn(),
  sendMissingStateErrorToTab: vi.fn(),
  sendMessage: vi.fn(),
  trackRpcRequestError: vi.fn(),
}));

vi.mock('@shared/storage/get-root-state', () => ({
  getRootState: mocks.getRootState,
  sendMissingStateErrorToTab: mocks.sendMissingStateErrorToTab,
}));

vi.mock('./rpc-helpers', () => ({
  trackRpcRequestError: mocks.trackRpcRequestError,
}));

const hostname = 'app.example.com';
const fingerprint = 'abcd1234';
const frameId = 42;
const tabId = 7;
const request: RpcRequests = { jsonrpc: '2.0', id: 'req-1', method: 'supportedMethods' };

function buildPort() {
  return {
    sender: { frameId, url: `https://${hostname}`, tab: { id: tabId } },
  } as unknown as chrome.runtime.Port;
}

function buildWalletEntities(fingerprints: string[]) {
  const entities: Record<string, unknown> = {};
  for (const value of fingerprints)
    entities[value] = { fingerprint: value, type: 'software', name: 'Wallet', createdOn: null };
  return entities;
}

function buildPermission(overrides: Record<string, unknown> = {}) {
  return {
    origin: hostname,
    fingerprint,
    accountIndex: 0,
    requestedAccounts: '2024-01-01T00:00:00.000Z',
    networkMode: 'mainnet',
    ...overrides,
  };
}

function buildState({
  permission,
  walletFingerprints,
}: {
  permission?: Record<string, unknown>;
  walletFingerprints: string[];
}) {
  return {
    appPermissions: { entities: permission ? { [hostname]: permission } : {} },
    wallets: { entities: buildWalletEntities(walletFingerprints) },
  };
}

describe(makeNetworkRequestParam.name, () => {
  test('defaults to mainnet when the request omits network', () => {
    expect(makeNetworkRequestParam()).toEqual(['network', 'mainnet']);
    expect(makeNetworkRequestParam(undefined)).toEqual(['network', 'mainnet']);
  });

  test('passes through the requested network', () => {
    expect(makeNetworkRequestParam('testnet')).toEqual(['network', 'testnet']);
    expect(makeNetworkRequestParam('signet')).toEqual(['network', 'signet']);
  });
});

describe(createConnectingAppSearchParamsWithLastKnownAccount.name, () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('preserves the originating frame in popup request metadata', async () => {
    mocks.getRootState.mockResolvedValue(buildState({ walletFingerprints: [] }));

    const result = await createConnectingAppSearchParamsWithLastKnownAccount(buildPort());

    expect(result.frameId).toBe(frameId);
    expect(result.tabId).toBe(tabId);
    expect(result.urlParams.get('frameId')).toBe(frameId.toString());
    expect(result.urlParams.get('tabId')).toBe(tabId.toString());
  });

  test('pins the last known account from the origin permission', async () => {
    mocks.getRootState.mockResolvedValue(
      buildState({ permission: buildPermission({ accountIndex: 3 }), walletFingerprints: [] })
    );

    const result = await createConnectingAppSearchParamsWithLastKnownAccount(buildPort());

    expect(result.urlParams.get('accountIndex')).toBe('3');
    expect(result.urlParams.get('fingerprint')).toBe(fingerprint);
    expect(result.urlParams.get('policyId')).toBeNull();
  });

  test('pins the bound policy from the origin permission', async () => {
    const policyId = `${fingerprint}/0/bc1qaddr/mainnet`;
    mocks.getRootState.mockResolvedValue(
      buildState({ permission: buildPermission({ policyId }), walletFingerprints: [] })
    );

    const result = await createConnectingAppSearchParamsWithLastKnownAccount(buildPort());

    expect(result.urlParams.get('accountIndex')).toBe('0');
    expect(result.urlParams.get('fingerprint')).toBe(fingerprint);
    expect(result.urlParams.get('policyId')).toBe(policyId);
  });

  test('keeps a request-scoped account and suppresses the policy binding', async () => {
    const policyId = `${fingerprint}/0/bc1qaddr/mainnet`;
    mocks.getRootState.mockResolvedValue(
      buildState({ permission: buildPermission({ policyId }), walletFingerprints: [] })
    );

    const result = await createConnectingAppSearchParamsWithLastKnownAccount(buildPort(), [
      ['accountIndex', '2'],
    ]);

    expect(result.urlParams.get('accountIndex')).toBe('2');
    expect(result.urlParams.get('fingerprint')).toBe(fingerprint);
    expect(result.urlParams.get('policyId')).toBeNull();
  });

  test('pins only the fingerprint when the permission lacks an account index', async () => {
    const policyId = `${fingerprint}/0/bc1qaddr/mainnet`;
    mocks.getRootState.mockResolvedValue(
      buildState({
        permission: buildPermission({ accountIndex: undefined, policyId }),
        walletFingerprints: [],
      })
    );

    const result = await createConnectingAppSearchParamsWithLastKnownAccount(buildPort());

    expect(result.urlParams.get('accountIndex')).toBeNull();
    expect(result.urlParams.get('fingerprint')).toBe(fingerprint);
    expect(result.urlParams.get('policyId')).toBeNull();
  });

  test('pins nothing when the origin has no permission', async () => {
    mocks.getRootState.mockResolvedValue(buildState({ walletFingerprints: [] }));

    const result = await createConnectingAppSearchParamsWithLastKnownAccount(buildPort());

    expect(result.urlParams.get('accountIndex')).toBeNull();
    expect(result.urlParams.get('fingerprint')).toBeNull();
    expect(result.urlParams.get('policyId')).toBeNull();
  });
});

describe('validateConnectedWalletExists', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', { tabs: { sendMessage: mocks.sendMessage } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('succeeds when the connected wallet still exists', async () => {
    mocks.getRootState.mockResolvedValue(
      buildState({ permission: buildPermission(), walletFingerprints: [fingerprint] })
    );

    const result = await validateConnectedWalletExists(request, buildPort());

    expect(result).toEqual({ status: 'success' });
    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.sendMissingStateErrorToTab).not.toHaveBeenCalled();
  });

  test('fails with UNAUTHENTICATED when the pinned wallet was removed', async () => {
    mocks.getRootState.mockResolvedValue(
      buildState({ permission: buildPermission(), walletFingerprints: [] })
    );

    const result = await validateConnectedWalletExists(request, buildPort());

    expect(result).toEqual({ status: 'failure' });
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        id: request.id,
        error: expect.objectContaining({ code: RpcErrorCode.UNAUTHENTICATED }),
      }),
      { frameId }
    );
  });

  test('fails with UNAUTHENTICATED when no permission exists for the origin', async () => {
    mocks.getRootState.mockResolvedValue(buildState({ walletFingerprints: [fingerprint] }));

    const result = await validateConnectedWalletExists(request, buildPort());

    expect(result).toEqual({ status: 'failure' });
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({
        error: expect.objectContaining({ code: RpcErrorCode.UNAUTHENTICATED }),
      }),
      { frameId }
    );
  });

  test('fails when the permission has never been granted account access', async () => {
    mocks.getRootState.mockResolvedValue(
      buildState({
        permission: buildPermission({ requestedAccounts: undefined }),
        walletFingerprints: [fingerprint],
      })
    );

    const result = await validateConnectedWalletExists(request, buildPort());

    expect(result).toEqual({ status: 'failure' });
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
  });

  test('fails and reports missing state when the wallet is not initialized', async () => {
    mocks.getRootState.mockResolvedValue(null);

    const result = await validateConnectedWalletExists(request, buildPort());

    expect(result).toEqual({ status: 'failure' });
    expect(mocks.sendMissingStateErrorToTab).toHaveBeenCalledWith({
      frameId,
      tabId,
      method: request.method,
      id: request.id,
    });
    expect(mocks.sendMessage).not.toHaveBeenCalled();
  });

  test('fails and reports missing state when persisted state predates multiwallet support', async () => {
    mocks.getRootState.mockResolvedValue({
      appPermissions: { entities: { [hostname]: buildPermission() } },
    });

    const result = await validateConnectedWalletExists(request, buildPort());

    expect(result).toEqual({ status: 'failure' });
    expect(mocks.sendMissingStateErrorToTab).toHaveBeenCalledWith({
      frameId,
      tabId,
      method: request.method,
      id: request.id,
    });
    expect(mocks.sendMessage).not.toHaveBeenCalled();
  });

  test('forwards a custom error message into the rejection', async () => {
    const errorMessage = 'Permission denied, user must first connect to the wallet';
    mocks.getRootState.mockResolvedValue(
      buildState({ permission: buildPermission(), walletFingerprints: [] })
    );

    await validateConnectedWalletExists(request, buildPort(), errorMessage);

    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      expect.objectContaining({ error: expect.objectContaining({ message: errorMessage }) }),
      { frameId }
    );
  });
});
