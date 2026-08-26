// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import BitcoinApp from 'ledger-bitcoin';

import { useRequestLedgerKeys } from './use-request-ledger-keys';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toErrorStep: vi.fn(),
  toStacksAppOutdatedWarning: vi.fn(),
  publicKeysPulledFromLedgerSuccessfully: vi.fn(),
}));

vi.mock('../../hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toErrorStep: mocks.toErrorStep,
    toStacksAppOutdatedWarning: mocks.toStacksAppOutdatedWarning,
  }),
}));

vi.mock('../../hooks/use-ledger-analytics.hook', () => ({
  useLedgerAnalytics: () => ({
    publicKeysPulledFromLedgerSuccessfully: mocks.publicKeysPulledFromLedgerSuccessfully,
  }),
}));

vi.mock('@leather.io/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@leather.io/utils')>();
  return { ...actual, delay: () => Promise.resolve() };
});

const bitcoinAppVersion = {
  name: 'Bitcoin',
  version: '2.1.0',
  flags: 0,
  chain: 'bitcoin' as const,
};

function makeFakeBitcoinApp(transportClose: () => Promise<void>): BitcoinApp {
  const app: BitcoinApp = Object.create(BitcoinApp.prototype);
  Object.defineProperty(app, 'transport', {
    value: { close: transportClose },
    configurable: true,
  });
  return app;
}

function renderHookValue<T>(useHook: () => T) {
  let value: T | undefined;
  function TestComponent() {
    value = useHook();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  act(() => {
    root.render(createElement(TestComponent));
  });
  return {
    getValue(): T {
      if (value === undefined) throw new Error('Hook did not render a value');
      return value;
    },
  };
}

interface SetupOptions {
  pullKeysResult: { status: 'success' } | { status: 'failure' };
  passesAdditionalVersionCheck?(appVersion: unknown): Promise<boolean>;
}

function setupRequestKeys({ pullKeysResult, passesAdditionalVersionCheck }: SetupOptions) {
  const onSuccess = vi.fn();
  const transportClose = vi.fn().mockResolvedValue(undefined);
  const pullKeysFromDevice = vi.fn().mockResolvedValue(pullKeysResult);
  const app = makeFakeBitcoinApp(transportClose);

  const { getValue } = renderHookValue(() =>
    useRequestLedgerKeys<BitcoinApp>({
      chain: 'bitcoin',
      connectApp: () => Promise.resolve(app),
      getAppVersion: () => Promise.resolve(bitcoinAppVersion),
      isAppOpen: () => true,
      pullKeysFromDevice,
      passesAdditionalVersionCheck,
      onSuccess,
    })
  );

  return { getValue, onSuccess, transportClose, pullKeysFromDevice };
}

describe(useRequestLedgerKeys.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('fires success analytics and onSuccess when the key pull succeeds', async () => {
    const { getValue, onSuccess, transportClose, pullKeysFromDevice } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(pullKeysFromDevice).toHaveBeenCalledOnce();
    expect(mocks.publicKeysPulledFromLedgerSuccessfully).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('does not fire success analytics or onSuccess when the key pull reports failure', async () => {
    const { getValue, onSuccess, transportClose, pullKeysFromDevice } = setupRequestKeys({
      pullKeysResult: { status: 'failure' },
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(pullKeysFromDevice).toHaveBeenCalledOnce();
    expect(mocks.publicKeysPulledFromLedgerSuccessfully).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('stops before pulling keys when the additional version check fails', async () => {
    const passesAdditionalVersionCheck = vi.fn().mockResolvedValue(false);
    const { getValue, onSuccess, transportClose, pullKeysFromDevice } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
      passesAdditionalVersionCheck,
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(passesAdditionalVersionCheck).toHaveBeenCalledWith(bitcoinAppVersion);
    expect(pullKeysFromDevice).not.toHaveBeenCalled();
    expect(mocks.toConnectionSuccessStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('continues to pull keys when the additional version check passes', async () => {
    const passesAdditionalVersionCheck = vi.fn().mockResolvedValue(true);
    const { getValue, onSuccess, transportClose, pullKeysFromDevice } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
      passesAdditionalVersionCheck,
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(passesAdditionalVersionCheck).toHaveBeenCalledWith(bitcoinAppVersion);
    expect(pullKeysFromDevice).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(transportClose).toHaveBeenCalledOnce();
  });
});
