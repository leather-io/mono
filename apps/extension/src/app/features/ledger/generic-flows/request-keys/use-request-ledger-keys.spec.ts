// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import {
  type HardwareWalletConnector,
  HardwareWalletError,
  type HardwareWalletSession,
} from '@leather.io/ledger';
import {
  makeFakeHardwareWallet,
  makeFakeHardwareWalletConnector,
  makeFakeHardwareWalletSession,
} from '@leather.io/ledger/test-utils';
import type * as LeatherUtils from '@leather.io/utils';

import { useRequestLedgerKeys } from './use-request-ledger-keys';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectStep: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toErrorStep: vi.fn(),
  toDeviceDisconnectStep: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  toPairDeviceStep: vi.fn(),
  toDevicePayloadInvalid: vi.fn(),
  toStacksAppOutdatedWarning: vi.fn(),
  publicKeysPulledFromLedgerSuccessfully: vi.fn(),
  connect: vi.fn(),
  close: vi.fn(),
}));

vi.mock('../../flow/ledger-flow.context', () => ({
  useLedgerSteps: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectStep: mocks.toConnectStep,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toErrorStep: mocks.toErrorStep,
    toDeviceDisconnectStep: mocks.toDeviceDisconnectStep,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
    toPairDeviceStep: mocks.toPairDeviceStep,
    toDevicePayloadInvalid: mocks.toDevicePayloadInvalid,
    toStacksAppOutdatedWarning: mocks.toStacksAppOutdatedWarning,
  }),
}));

vi.mock('../../hooks/use-ledger-analytics.hook', () => ({
  useLedgerAnalytics: () => ({
    publicKeysPulledFromLedgerSuccessfully: mocks.publicKeysPulledFromLedgerSuccessfully,
  }),
}));

vi.mock('../../hardware-wallet/hardware-wallet.context', () => ({
  useHardwareWalletConnector: () => makeFakeHardwareWalletConnector({ connect: mocks.connect }),
}));

vi.mock('@leather.io/bitcoin', () => ({
  makeNativeSegwitAccountDerivationPath: vi.fn(),
  makeTaprootAccountDerivationPath: vi.fn(),
}));

vi.mock('@leather.io/utils', async importOriginal => {
  const actual = await importOriginal<typeof LeatherUtils>();
  return { ...actual, delay: () => Promise.resolve() };
});

const bitcoinRequest = { chain: 'bitcoin', network: 'mainnet' } as const;

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

function makeSession() {
  return makeFakeHardwareWalletSession({ wallet: makeFakeHardwareWallet(), close: mocks.close });
}

interface SetupOptions {
  pullKeysResult?: { status: 'success' } | { status: 'failure' };
  pullKeysError?: unknown;
  connectError?: unknown;
  connect?: HardwareWalletConnector['connect'];
}

function setupRequestKeys({ pullKeysResult, pullKeysError, connectError, connect }: SetupOptions) {
  const onSuccess = vi.fn();
  const pullKeysFromDevice = pullKeysError
    ? vi.fn().mockRejectedValue(pullKeysError)
    : vi.fn().mockResolvedValue(pullKeysResult);
  if (connect) mocks.connect.mockImplementation(connect);
  else if (connectError) mocks.connect.mockRejectedValue(connectError);
  else mocks.connect.mockResolvedValue(makeSession());

  const { getValue } = renderHookValue(() =>
    useRequestLedgerKeys({ connectRequest: bitcoinRequest, pullKeysFromDevice, onSuccess })
  );

  return { getValue, onSuccess, pullKeysFromDevice };
}

describe(useRequestLedgerKeys.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.close.mockResolvedValue(undefined);
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
    expect(mocks.close).toHaveBeenCalledOnce();
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
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('shows the outdated app warning and never pulls keys', async () => {
    const details = { currentVersion: '0.26.17', requiredVersion: '0.26.19' };
    const { getValue, onSuccess, pullKeysFromDevice } = setupRequestKeys({
      connectError: new HardwareWalletError('outdated-app', { details }),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toStacksAppOutdatedWarning).toHaveBeenCalledWith(details);
    expect(pullKeysFromDevice).not.toHaveBeenCalled();
    expect(mocks.toConnectionSuccessStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('returns to the connect step when the device reports locked mid-flow', async () => {
    const { getValue, onSuccess } = setupRequestKeys({
      pullKeysError: new HardwareWalletError('locked'),
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
      pullKeysError: new HardwareWalletError('disconnected'),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('shows the operation rejected step when the user refuses on the device', async () => {
    const { getValue, onSuccess } = setupRequestKeys({
      pullKeysError: new HardwareWalletError('rejected'),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('stays silent and closes the session when the user cancelled the action', async () => {
    const { getValue } = setupRequestKeys({
      pullKeysError: new HardwareWalletError('cancelled'),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(mocks.toOperationRejectedStep).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('shows the locked warning while the open-app action waits for an unlock', async () => {
    const { getValue } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
      connect(_request, ctx) {
        ctx.onInteraction?.({ type: 'unlock-device' });
        return Promise.resolve(makeSession());
      },
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: true });
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
  });

  test('reports the connection as cancellable while the device waits for the user', async () => {
    const connection = Promise.withResolvers<HardwareWalletSession>();
    const { getValue } = setupRequestKeys({
      pullKeysResult: { status: 'success' },
      connect(_request, ctx) {
        ctx.onInteraction?.({ type: 'open-app', appName: 'Bitcoin' });
        return connection.promise;
      },
    });

    const { requesting } = await act(() => ({ requesting: getValue().requestKeys() }));

    expect(getValue().awaitingDeviceConnection).toBe(true);
    expect(getValue().isConnectionCancellable).toBe(true);

    await act(async () => {
      connection.resolve(makeSession());
      await requesting;
    });

    expect(getValue().awaitingDeviceConnection).toBe(false);
    expect(getValue().isConnectionCancellable).toBe(false);
  });

  test('stays silent when the user cancels while connecting', async () => {
    const { getValue, onSuccess } = setupRequestKeys({
      connectError: new HardwareWalletError('cancelled'),
    });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(getValue().awaitingDeviceConnection).toBe(false);
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  test('surfaces the wrong-app message on the error step without a session to close', async () => {
    const wrongApp = new HardwareWalletError('wrong-app', {
      message: 'Unable to open the Bitcoin Test app on your Ledger.',
    });
    const { getValue, onSuccess } = setupRequestKeys({ connectError: wrongApp });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toErrorStep).toHaveBeenCalledWith('bitcoin', wrongApp.message);
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  test('sends an unpaired popup to the pairing step', async () => {
    const { getValue } = setupRequestKeys({ connectError: new HardwareWalletError('not-paired') });

    await act(async () => {
      await getValue().requestKeys();
    });

    expect(mocks.toPairDeviceStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
  });
});
