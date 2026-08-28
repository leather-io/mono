// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import BitcoinApp from '@ledgerhq/ledger-bitcoin';

import { useLedgerSignTx } from './use-ledger-sign-tx';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectStep: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toErrorStep: vi.fn(),
}));

vi.mock('../../hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectStep: mocks.toConnectStep,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toErrorStep: mocks.toErrorStep,
  }),
}));

vi.mock('@leather.io/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@leather.io/utils')>();
  return { ...actual, delay: () => Promise.resolve() };
});

// The real client module loads @bitcoinerlab/descriptors at import time, whose
// ecc self-test fails under jsdom; this spec only needs a prototype for fakes.
vi.mock('@ledgerhq/ledger-bitcoin', () => ({ default: class {} }));

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

function makeNamedError(name: string, message: string) {
  const error = new Error(message);
  error.name = name;
  return error;
}

interface SetupOptions {
  connectAppError?: Error;
  getAppVersionError?: Error;
  signError?: Error;
}

function setupSignTx({ connectAppError, getAppVersionError, signError }: SetupOptions = {}) {
  const onSuccess = vi.fn();
  const transportClose = vi.fn().mockResolvedValue(undefined);
  const signTransactionWithDevice = signError
    ? vi.fn().mockRejectedValue(signError)
    : vi.fn().mockResolvedValue(undefined);
  const getAppVersion = getAppVersionError
    ? vi.fn().mockRejectedValue(getAppVersionError)
    : vi.fn().mockResolvedValue(bitcoinAppVersion);
  const app = makeFakeBitcoinApp(transportClose);

  const { getValue } = renderHookValue(() =>
    useLedgerSignTx<BitcoinApp>({
      chain: 'bitcoin',
      connectApp: () => (connectAppError ? Promise.reject(connectAppError) : Promise.resolve(app)),
      getAppVersion,
      isAppOpen: () => true,
      signTransactionWithDevice,
      onSuccess,
    })
  );

  return { getValue, onSuccess, transportClose, signTransactionWithDevice };
}

describe(useLedgerSignTx.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('signs and fires onSuccess when the device flow completes', async () => {
    const { getValue, onSuccess, transportClose, signTransactionWithDevice } = setupSignTx();

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(signTransactionWithDevice).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(transportClose).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
  });

  test('returns to the connect step when the device reports locked on connect', async () => {
    const lockedError = makeNamedError('LockedDeviceError', 'LockedDeviceError');
    const { getValue, onSuccess } = setupSignTx({ connectAppError: lockedError });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: true });
    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('returns to the connect step when the device reports locked mid-flow', async () => {
    const lockedError = makeNamedError('LockedDeviceError', 'LockedDeviceError');
    const { getValue, onSuccess, transportClose } = setupSignTx({
      getAppVersionError: lockedError,
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toCheckingAppVersion).toHaveBeenCalledOnce();
    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('surfaces the app-open failure message on the error step', async () => {
    const appOpenError = makeNamedError(
      'AppOpenFailed',
      'Unable to open the Bitcoin Test app on your Ledger.'
    );
    const { getValue, onSuccess } = setupSignTx({ connectAppError: appOpenError });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toErrorStep).toHaveBeenCalledWith('bitcoin', appOpenError.message);
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('falls back to the generic error step for other failures', async () => {
    const { getValue, onSuccess } = setupSignTx({ signError: new Error('boom') });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toErrorStep).toHaveBeenCalledWith('bitcoin');
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
