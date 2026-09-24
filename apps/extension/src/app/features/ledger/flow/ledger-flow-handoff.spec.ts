import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import {
  consumeLedgerFlowHandoff,
  handOffLedgerFlowToFullPage,
  ledgerFlowHandoffParam,
} from './ledger-flow-handoff';
import type { LedgerFlowHandoffRequest } from './ledger-flow.types';

const h = vi.hoisted(() => ({
  openInNewTab: vi.fn(),
  closeWindow: vi.fn(),
}));

vi.mock('@app/common/utils/open-in-new-tab', () => ({ openIndexPageInNewTab: h.openInNewTab }));

vi.mock('@shared/utils', () => ({ closeWindow: h.closeWindow }));

const handoffKey = 'ledger-flow-intent';
const token = '11111111-2222-3333-4444-555555555555';
const otherToken = '66666666-7777-8888-9999-000000000000';
const handoffSearch = `?${ledgerFlowHandoffParam}=${token}`;
const request: LedgerFlowHandoffRequest = { kind: 'verify-address', variant: 'btcTaproot' };

function installSessionStorage(store: Record<string, unknown> = {}) {
  const calls: string[] = [];
  const session = {
    async set(items: Record<string, unknown>) {
      calls.push('set');
      Object.assign(store, items);
    },
    async get(key: string) {
      return { [key]: store[key] };
    },
    async remove(key: string) {
      delete store[key];
    },
  };
  Reflect.set(globalThis, 'chrome', { storage: { session } });
  h.openInNewTab.mockImplementation(async () => {
    calls.push('open');
  });
  return { store, calls };
}

describe('ledger flow hand-off', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-18T10:00:00Z'));
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(token);
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(globalThis, 'chrome');
  });

  test('stores the request before opening the full page tab', async () => {
    const { store, calls } = installSessionStorage();

    await handOffLedgerFlowToFullPage(request);

    expect(store[handoffKey]).toEqual({ request, createdAt: Date.now(), token });
    expect(calls).toEqual(['set', 'open']);
    expect(h.openInNewTab).toHaveBeenCalledWith(RouteUrls.Home, handoffSearch);
    expect(h.closeWindow).not.toHaveBeenCalled();
  });

  test('opens the requested target and closes the window when asked', async () => {
    installSessionStorage();

    await handOffLedgerFlowToFullPage(request, {
      target: RouteUrls.Onboarding,
      closeCurrentWindow: true,
    });

    expect(h.openInNewTab).toHaveBeenCalledWith(RouteUrls.Onboarding, handoffSearch);
    expect(h.closeWindow).toHaveBeenCalledOnce();
  });

  test('stores request-keys hand-offs with auto connect disabled', async () => {
    const { store } = installSessionStorage();

    await handOffLedgerFlowToFullPage({
      kind: 'request-keys',
      chain: 'bitcoin',
      autoConnect: true,
    });

    expect(store[handoffKey]).toEqual({
      request: { kind: 'request-keys', chain: 'bitcoin', autoConnect: false },
      createdAt: Date.now(),
      token,
    });
  });

  test('stores other hand-off requests untouched', async () => {
    const { store } = installSessionStorage();

    await handOffLedgerFlowToFullPage({ kind: 'connect-start' });

    expect(store[handoffKey]).toEqual({
      request: { kind: 'connect-start' },
      createdAt: Date.now(),
      token,
    });
  });

  test('still opens the tab when session storage is unavailable', async () => {
    Reflect.set(globalThis, 'chrome', { storage: {} });

    await handOffLedgerFlowToFullPage(request);

    expect(h.openInNewTab).toHaveBeenCalledWith(RouteUrls.Home, handoffSearch);
  });

  test('consumes a pending request once for the matching token', async () => {
    const { store } = installSessionStorage({
      [handoffKey]: { request, createdAt: Date.now(), token },
    });

    await expect(consumeLedgerFlowHandoff(token)).resolves.toEqual(request);
    expect(store[handoffKey]).toBeUndefined();
    await expect(consumeLedgerFlowHandoff(token)).resolves.toBeNull();
  });

  test('leaves the record for another tab when the token does not match', async () => {
    const { store } = installSessionStorage({
      [handoffKey]: { request, createdAt: Date.now(), token },
    });

    await expect(consumeLedgerFlowHandoff(otherToken)).resolves.toBeNull();
    expect(store[handoffKey]).toEqual({ request, createdAt: Date.now(), token });
  });

  test('leaves the record untouched when the page carries no token', async () => {
    const { store } = installSessionStorage({
      [handoffKey]: { request, createdAt: Date.now(), token },
    });

    await expect(consumeLedgerFlowHandoff(null)).resolves.toBeNull();
    expect(store[handoffKey]).toEqual({ request, createdAt: Date.now(), token });
  });

  test('ignores an expired request', async () => {
    const { store } = installSessionStorage({
      [handoffKey]: { request, createdAt: Date.now() - 61_000, token },
    });

    await expect(consumeLedgerFlowHandoff(token)).resolves.toBeNull();
    expect(store[handoffKey]).toBeUndefined();
  });

  test('ignores a malformed record', async () => {
    const { store } = installSessionStorage({ [handoffKey]: 'not-a-record' });

    await expect(consumeLedgerFlowHandoff(token)).resolves.toBeNull();
    expect(store[handoffKey]).toBeUndefined();
  });

  test('returns null when session storage is unavailable', async () => {
    Reflect.set(globalThis, 'chrome', { storage: {} });

    await expect(consumeLedgerFlowHandoff(token)).resolves.toBeNull();
  });
});
