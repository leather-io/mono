import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  ExternalMethods,
  type LegacyMessageFromContentScript,
  MESSAGE_SOURCE,
} from '@shared/message-types';
import { RouteUrls } from '@shared/route-urls';

import { walletNoLongerAvailableMessage } from '../rpc-request-utils';
import { handleLegacyExternalMethodFormat } from './legacy-external-message-handler';

const mocks = vi.hoisted(() => ({
  addTabRemovedListener: vi.fn(),
  addWindowRemovedListener: vi.fn(),
  getRootState: vi.fn(),
  popup: vi.fn(),
  queueAnalyticsRequest: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('@shared/storage/get-root-state', () => ({
  getRootState: mocks.getRootState,
  sendMissingStateErrorToTab: vi.fn(),
}));

vi.mock('@background/background-analytics', () => ({
  queueAnalyticsRequest: mocks.queueAnalyticsRequest,
}));

vi.mock('@background/popup', () => ({
  popup: mocks.popup,
}));

const hostname = 'app.example.com';
const fingerprint = 'abcd1234';
const frameId = 42;
const payload = 'request-token';
const tabId = 7;

function buildPort() {
  return {
    sender: { frameId, url: `https://${hostname}/page`, tab: { id: tabId } },
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

function buildLegacyMessage(
  method: LegacyMessageFromContentScript['method']
): LegacyMessageFromContentScript {
  return {
    method,
    payload,
    source: MESSAGE_SOURCE,
  } as LegacyMessageFromContentScript;
}

function expectLegacyUnavailableResponse({
  requestKey,
  responseKey,
  responseMethod,
}: {
  requestKey: string;
  responseKey: string;
  responseMethod: ExternalMethods;
}) {
  expect(mocks.sendMessage).toHaveBeenCalledWith(
    tabId,
    expect.objectContaining({
      method: responseMethod,
      payload: expect.objectContaining({
        [requestKey]: payload,
        [responseKey]: walletNoLongerAvailableMessage,
      }),
      source: MESSAGE_SOURCE,
    }),
    { frameId }
  );
}

interface GuardedLegacyRequestTestCase {
  method: LegacyMessageFromContentScript['method'];
  requestKey: string;
  responseKey: string;
  responseMethod: ExternalMethods;
}

describe('handleLegacyExternalMethodFormat', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', {
      tabs: {
        onRemoved: { addListener: mocks.addTabRemovedListener },
        sendMessage: mocks.sendMessage,
      },
      windows: {
        onRemoved: { addListener: mocks.addWindowRemovedListener },
      },
    });

    mocks.popup.mockResolvedValue({ id: 42 });
    mocks.queueAnalyticsRequest.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test.each<GuardedLegacyRequestTestCase>([
    {
      method: ExternalMethods.transactionRequest,
      requestKey: 'transactionRequest',
      responseKey: 'transactionResponse',
      responseMethod: ExternalMethods.transactionResponse,
    },
    {
      method: ExternalMethods.signatureRequest,
      requestKey: 'signatureRequest',
      responseKey: 'signatureResponse',
      responseMethod: ExternalMethods.signatureResponse,
    },
    {
      method: ExternalMethods.structuredDataSignatureRequest,
      requestKey: 'signatureRequest',
      responseKey: 'signatureResponse',
      responseMethod: ExternalMethods.signatureResponse,
    },
    {
      method: ExternalMethods.psbtRequest,
      requestKey: 'psbtRequest',
      responseKey: 'psbtResponse',
      responseMethod: ExternalMethods.psbtResponse,
    },
  ])('rejects stale-wallet legacy $method before opening a popup', async testCase => {
    mocks.getRootState.mockResolvedValue(
      buildState({
        permission: buildPermission({ fingerprint: 'removed-wallet' }),
        walletFingerprints: [fingerprint],
      })
    );

    await handleLegacyExternalMethodFormat(buildLegacyMessage(testCase.method), buildPort());

    expectLegacyUnavailableResponse(testCase);
    expect(mocks.popup).not.toHaveBeenCalled();
    expect(mocks.addWindowRemovedListener).not.toHaveBeenCalled();
    expect(mocks.addTabRemovedListener).not.toHaveBeenCalled();
    expect(mocks.queueAnalyticsRequest).not.toHaveBeenCalled();
  });

  test('rejects legacy signing requests when the origin has no connected wallet permission', async () => {
    mocks.getRootState.mockResolvedValue(buildState({ walletFingerprints: [fingerprint] }));

    await handleLegacyExternalMethodFormat(
      buildLegacyMessage(ExternalMethods.psbtRequest),
      buildPort()
    );

    expectLegacyUnavailableResponse({
      requestKey: 'psbtRequest',
      responseKey: 'psbtResponse',
      responseMethod: ExternalMethods.psbtResponse,
    });
    expect(mocks.popup).not.toHaveBeenCalled();
  });

  test('does not guard legacy authentication requests', async () => {
    mocks.getRootState.mockResolvedValue(null);

    await handleLegacyExternalMethodFormat(
      buildLegacyMessage(ExternalMethods.authenticationRequest),
      buildPort()
    );

    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.popup).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining(RouteUrls.ChooseAccount) })
    );
    expect(mocks.addWindowRemovedListener).toHaveBeenCalledTimes(1);
    expect(mocks.addTabRemovedListener).toHaveBeenCalledTimes(1);
  });

  test('opens a legacy signing popup when the connected wallet still exists', async () => {
    mocks.getRootState.mockResolvedValue(
      buildState({ permission: buildPermission(), walletFingerprints: [fingerprint] })
    );

    await handleLegacyExternalMethodFormat(
      buildLegacyMessage(ExternalMethods.psbtRequest),
      buildPort()
    );

    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.popup).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining(RouteUrls.PsbtRequest) })
    );
    expect(mocks.addWindowRemovedListener).toHaveBeenCalledTimes(1);
    expect(mocks.addTabRemovedListener).toHaveBeenCalledTimes(1);
  });
});
