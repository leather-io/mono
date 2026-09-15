// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { UserInteractionRequired } from '@ledgerhq/device-management-kit';

import type { ConnectLedgerDeviceOptions } from '../../dmk/ledger-device-connection';
import { LedgerConnectionErrors } from '../../dmk/ledger-dmk-errors';
import { makeFakeDmk } from '../../dmk/ledger-dmk.mocks';
import type { LedgerBitcoinApp } from '../../utils/ledger-app';
import { fakeLedgerSessionId, makeFakeLedgerBitcoinApp } from '../../utils/ledger-app.mocks';
import { useLedgerSignTx } from './use-ledger-sign-tx';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectStep: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toErrorStep: vi.fn(),
  toDeviceDisconnectStep: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('../../hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectStep: mocks.toConnectStep,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toErrorStep: mocks.toErrorStep,
    toDeviceDisconnectStep: mocks.toDeviceDisconnectStep,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
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

function makeNamedError(name: string, message: string) {
  const error = new Error(message);
  error.name = name;
  return error;
}

interface SetupOptions {
  connectAppError?: unknown;
  connectApp?(options: ConnectLedgerDeviceOptions): Promise<LedgerBitcoinApp>;
  getAppVersionError?: unknown;
  signError?: unknown;
}

function setupSignTx({
  connectAppError,
  connectApp,
  getAppVersionError,
  signError,
}: SetupOptions = {}) {
  const onSuccess = vi.fn();
  const signTransactionWithDevice = signError
    ? vi.fn().mockRejectedValue(signError)
    : vi.fn().mockResolvedValue(undefined);
  const getAppVersion = getAppVersionError
    ? vi.fn().mockRejectedValue(getAppVersionError)
    : vi.fn().mockResolvedValue(bitcoinAppVersion);
  const app = makeFakeLedgerBitcoinApp();

  const { getValue } = renderHookValue(() =>
    useLedgerSignTx<LedgerBitcoinApp>({
      chain: 'bitcoin',
      connectApp:
        connectApp ??
        (connectAppError
          ? vi.fn().mockRejectedValue(connectAppError)
          : vi.fn().mockResolvedValue(app)),
      getAppVersion,
      isAppOpen: () => true,
      signTransactionWithDevice,
      onSuccess,
    })
  );

  return { getValue, onSuccess, signTransactionWithDevice };
}

describe(useLedgerSignTx.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.disconnect.mockResolvedValue(undefined);
  });

  test('signs and fires onSuccess when the device flow completes', async () => {
    const { getValue, onSuccess, signTransactionWithDevice } = setupSignTx();

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(signTransactionWithDevice).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
    expect(mocks.disconnect).toHaveBeenCalledWith({ sessionId: fakeLedgerSessionId });
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
    expect(mocks.disconnect).not.toHaveBeenCalled();
  });

  test('returns to the connect step when the device reports locked mid-flow', async () => {
    const lockedError = makeNamedError('LockedDeviceError', 'LockedDeviceError');
    const { getValue, onSuccess } = setupSignTx({ getAppVersionError: lockedError });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toCheckingAppVersion).toHaveBeenCalledOnce();
    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
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

  test('returns to the connect step when the device reports a DMK locked error', async () => {
    const { getValue, onSuccess } = setupSignTx({
      connectAppError: { _tag: 'DeviceLockedError' },
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: true });
    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('shows the disconnected step when the device drops while signing', async () => {
    const { getValue, onSuccess } = setupSignTx({
      signError: { _tag: 'DeviceDisconnectedWhileSendingError' },
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });

  test('shows the operation rejected step when the user refuses on the device', async () => {
    const { getValue, onSuccess } = setupSignTx({
      signError: makeNamedError(LedgerConnectionErrors.OperationRejected, 'Rejected by user'),
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
  });

  test('shows the locked warning while the open-app action waits for an unlock', async () => {
    const { getValue, onSuccess } = setupSignTx({
      connectApp(options) {
        options.onRequiredUserInteraction?.(UserInteractionRequired.UnlockDevice);
        options.onRequiredUserInteraction?.(UserInteractionRequired.ConfirmOpenApp);
        return Promise.resolve(makeFakeLedgerBitcoinApp());
      },
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: false });
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledOnce();
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
