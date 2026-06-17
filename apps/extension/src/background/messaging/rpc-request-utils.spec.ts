import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RpcErrorCode, type RpcRequests } from '@leather.io/rpc';

import { validateConnectedWalletExists } from './rpc-request-utils';

const mocks = vi.hoisted(() => ({
  getRootState: vi.fn(),
  sendMissingStateErrorToTab: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('@shared/storage/get-root-state', () => ({
  getRootState: mocks.getRootState,
  sendMissingStateErrorToTab: mocks.sendMissingStateErrorToTab,
}));

const hostname = 'app.example.com';
const fingerprint = 'abcd1234';
const tabId = 7;
const request: RpcRequests = { jsonrpc: '2.0', id: 'req-1', method: 'supportedMethods' };

function buildPort() {
  return {
    sender: { url: `https://${hostname}`, tab: { id: tabId } },
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
      })
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
      })
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
      expect.objectContaining({ error: expect.objectContaining({ message: errorMessage }) })
    );
  });
});
