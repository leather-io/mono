// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { UserInteractionRequired } from '@ledgerhq/device-management-kit';

import type { ConnectLedgerDeviceOptions } from '../../dmk/ledger-device-connection';
import { LedgerConnectionErrors } from '../../dmk/ledger-dmk-errors';
import { makeFakeDmk } from '../../dmk/ledger-dmk.mocks';
import type { LedgerBitcoinApp } from '../../utils/ledger-app';
import { fakeLedgerSessionId, makeFakeLedgerBitcoinApp } from '../../utils/ledger-app.mocks';
import { useRequestLedgerKeys } from './use-request-ledger-keys';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectStep: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toErrorStep: vi.fn(),
  toDeviceDisconnectStep: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  toStacksAppOutdatedWarning: vi.fn(),
  publicKeysPulledFromLedgerSuccessfully: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('../../flow/ledger-flow.context', () => ({
  useLedgerSteps: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectStep: mocks.toConnectStep,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toErrorStep: mocks.toErrorStep,
    toDeviceDisconnectStep: mocks.toDeviceDisconnectStep,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
    toStacksAppOutdatedWarning: mocks.toStacksAppOutdatedWarning,
  }),
}));

vi.mock('../../hooks/use-ledger-analytics.hook', () => ({
  useLedgerAnalytics: () => ({
    publicKeysPulledFromLedgerSuccessfully: mocks.publicKeysPulledFromLedgerSuccessfully,
  }),
}));

vi.mock('../../dmk/ledger-dmk.context', () => ({
  useLedgerDmk: () => makeFakeDmk({ disconnect: mocks.disconnect }),
}));

vi.mock('@leather.io/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@leather.io/utils')>();
  return { ...actual, delay: () => Promise.resolve() };
});

const bitcoinAppVersion = {
  name: 'Bitcoin',
  version: '2.1.0',
  chain: 'bitcoin' as const,
};

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

function makeNamedError(name: string, message = name) {
  const error = new Error(message);
  error.name = name;
  return error;
}

interface SetupOptions {
  pullKeysResult?: { status: 'success' } | { status: 'failure' };
  pullKeysError?: unknown;
  connectAppError?: unknown;
  connectApp?(options: ConnectLedgerDeviceOptions): Promise<LedgerBitcoinApp>;
  passesAdditionalVersionCheck?(appVersion: unknown): Promise<boolean>;
}

function setupRequestKeys({
  pullKeysResult,
  pullKeysError,
  connectAppError,
  connectApp,
  passesAdditionalVersionCheck,
}: SetupOptions) {
  const onSuccess = vi.fn();
  const pullKeysFromDevice = pullKeysError
    ? vi.fn().mockRejectedValue(pullKeysError)
    : vi.fn().mockResolvedValue(pullKeysResult);
  const app = makeFakeLedgerBitcoinApp();

  const { getValue } = renderHookValue(() =>
    useRequestLedgerKeys<LedgerBitcoinApp>({
      chain: 'bitcoin',
      connectApp:
        connectApp ??
        (connectAppError
          ? vi.fn().mockRejectedValue(connectAppError)
          : vi.fn().mockResolvedValue(app)),
      getAppVersion: () => Promise.resolve(bitcoinAppVersion),
      isAppOpen: () => true,
      pullKeysFromDevice,
      passesAdditionalVersionCheck,
      onSuccess,
    })
  );

  return { getValue, onSuccess, pullKeysFromDevice };
}

describe(useRequestLedgerKeys.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.disconnect.mockResolvedValue(undefined);
  });

  test('fires success analytics and onSuccess when the key pull succeeds', async () => {
    const { getValue, onSuccess, pullKeysFromDevice } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(pullKeysFromDevice).toHaveBeenCalledOnce();
    expect(mocks.publicKeysPulledFromLedgerSuccessfully).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
    expect(mocks.disconnect).toHaveBeenCalledWith({ sessionId: fakeLedgerSessionId });
  });

  test('does not fire success analytics or onSuccess when the key pull reports failure', async () => {
    const { getValue, onSuccess, pullKeysFromDevice } = setupRequestKeys({
      pullKeysResult: { status: 'failure' },
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(pullKeysFromDevice).toHaveBeenCalledOnce();
    expect(mocks.publicKeysPulledFromLedgerSuccessfully).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });

  test('stops before pulling keys when the additional version check fails', async () => {
    const passesAdditionalVersionCheck = vi.fn().mockResolvedValue(false);
    const { getValue, onSuccess, pullKeysFromDevice } = setupRequestKeys({
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
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });

  test('continues to pull keys when the additional version check passes', async () => {
    const passesAdditionalVersionCheck = vi.fn().mockResolvedValue(true);
    const { getValue, onSuccess, pullKeysFromDevice } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
      passesAdditionalVersionCheck,
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(passesAdditionalVersionCheck).toHaveBeenCalledWith(bitcoinAppVersion);
    expect(pullKeysFromDevice).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });

  test('returns to the connect step when the device reports locked mid-flow', async () => {
    const { getValue, onSuccess } = setupRequestKeys({
      pullKeysError: makeNamedError('LockedDeviceError'),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('returns to the connect step when the device reports a DMK locked error', async () => {
    const { getValue, onSuccess } = setupRequestKeys({
      pullKeysError: { _tag: 'DeviceLockedError' },
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: true });
    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('shows the disconnected step when the device drops mid-flow', async () => {
    const { getValue, onSuccess } = setupRequestKeys({
      pullKeysError: { _tag: 'DeviceDisconnectedWhileSendingError' },
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });

  test('shows the operation rejected step when the user refuses on the device', async () => {
    const { getValue, onSuccess } = setupRequestKeys({
      pullKeysError: makeNamedError(LedgerConnectionErrors.OperationRejected),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });

  test('stays silent and closes the session when the user cancelled the action', async () => {
    const { getValue } = setupRequestKeys({
      pullKeysError: makeNamedError('LedgerActionCancelled'),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(mocks.toOperationRejectedStep).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });

  test('shows the locked warning while the open-app action waits for an unlock', async () => {
    const { getValue } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
      connectApp(options) {
        options.onRequiredUserInteraction?.(UserInteractionRequired.UnlockDevice);
        return Promise.resolve(makeFakeLedgerBitcoinApp());
      },
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: true });
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
  });

  test('reports the connection as cancellable while the device waits for the user', async () => {
    const connection = Promise.withResolvers<LedgerBitcoinApp>();
    const { getValue } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
      connectApp(options) {
        options.onRequiredUserInteraction?.(UserInteractionRequired.ConfirmOpenApp);
        return connection.promise;
      },
    });

    const { requesting } = await act(() => ({ requesting: getValue().requestKeys() }));

    expect(getValue().awaitingDeviceConnection).toBe(true);
    expect(getValue().isConnectionCancellable).toBe(true);

    await act(async () => {
      connection.resolve(makeFakeLedgerBitcoinApp());
      await requesting;
    });

    expect(getValue().awaitingDeviceConnection).toBe(false);
    expect(getValue().isConnectionCancellable).toBe(false);
  });

  test('stays silent when the user cancels while connecting', async () => {
    const { getValue, onSuccess } = setupRequestKeys({
      connectAppError: makeNamedError('LedgerActionCancelled'),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(getValue().awaitingDeviceConnection).toBe(false);
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.disconnect).not.toHaveBeenCalled();
  });

  test('surfaces the app-open failure message on the error step without a session to close', async () => {
    const appOpenError = makeNamedError(
      'AppOpenFailed',
      'Unable to open the Bitcoin Test app on your Ledger.'
    );
    const { getValue, onSuccess } = setupRequestKeys({ connectAppError: appOpenError });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toErrorStep).toHaveBeenCalledWith('bitcoin', appOpenError.message);
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.disconnect).not.toHaveBeenCalled();
  });
});
