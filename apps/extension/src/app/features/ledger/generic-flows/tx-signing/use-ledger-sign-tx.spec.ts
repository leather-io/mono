// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import {
  type HardwareWalletConnector,
  HardwareWalletError,
  type HardwareWalletSession,
  type OperationContext,
} from '@leather.io/ledger';
import {
  makeFakeHardwareWallet,
  makeFakeHardwareWalletConnector,
  makeFakeHardwareWalletSession,
} from '@leather.io/ledger/test-utils';
import type * as LeatherUtils from '@leather.io/utils';

import { useLedgerSignTx } from './use-ledger-sign-tx';

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
  connectError?: unknown;
  connect?: HardwareWalletConnector['connect'];
  signError?: unknown;
}

function setupSignTx({ connectError, connect, signError }: SetupOptions = {}) {
  const onSuccess = vi.fn();
  const signTransactionWithDevice = signError
    ? vi.fn().mockRejectedValue(signError)
    : vi.fn().mockResolvedValue(undefined);
  if (connect) mocks.connect.mockImplementation(connect);
  else if (connectError) mocks.connect.mockRejectedValue(connectError);
  else mocks.connect.mockResolvedValue(makeSession());

  const { getValue } = renderHookValue(() =>
    useLedgerSignTx({ connectRequest: bitcoinRequest, signTransactionWithDevice, onSuccess })
  );

  return { getValue, onSuccess, signTransactionWithDevice };
}

describe(useLedgerSignTx.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.close.mockResolvedValue(undefined);
  });

  test('signs and fires onSuccess when the device flow completes', async () => {
    const { getValue, onSuccess, signTransactionWithDevice } = setupSignTx();

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.connect).toHaveBeenCalledWith(bitcoinRequest, expect.anything());
    expect(mocks.toCheckingAppVersion).toHaveBeenCalledOnce();
    expect(mocks.toConnectionSuccessStep).toHaveBeenCalledWith('bitcoin');
    expect(signTransactionWithDevice).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(mocks.close).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
  });

  test('returns to the connect step when the device reports locked on connect', async () => {
    const { getValue, onSuccess } = setupSignTx({
      connectError: new HardwareWalletError('locked'),
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: true });
    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  test('returns to the connect step and closes the session when locked mid-flow', async () => {
    const { getValue, onSuccess } = setupSignTx({ signError: new HardwareWalletError('locked') });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('surfaces the wrong-app message on the error step', async () => {
    const wrongApp = new HardwareWalletError('wrong-app', {
      message: 'Unable to open the Bitcoin Test app on your Ledger.',
    });
    const { getValue, onSuccess } = setupSignTx({ connectError: wrongApp });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toErrorStep).toHaveBeenCalledWith('bitcoin', wrongApp.message);
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('shows the outdated app warning with the version details', async () => {
    const details = { currentVersion: '0.26.17', requiredVersion: '0.26.19' };
    const { getValue } = setupSignTx({
      connectError: new HardwareWalletError('outdated-app', { details }),
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toStacksAppOutdatedWarning).toHaveBeenCalledWith(details);
  });

  test('sends an unpaired popup to the pairing step', async () => {
    const { getValue } = setupSignTx({ connectError: new HardwareWalletError('not-paired') });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toPairDeviceStep).toHaveBeenCalledOnce();
  });

  test('shows the disconnected step when the device drops while signing', async () => {
    const { getValue, onSuccess } = setupSignTx({
      signError: new HardwareWalletError('disconnected'),
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('shows the operation rejected step when the user refuses on the device', async () => {
    const { getValue, onSuccess } = setupSignTx({
      signError: new HardwareWalletError('rejected'),
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('shows the locked warning while the open-app action waits for an unlock', async () => {
    const { getValue, onSuccess } = setupSignTx({
      connect(_request, ctx) {
        ctx.onInteraction?.({ type: 'unlock-device' });
        ctx.onInteraction?.({ type: 'open-app', appName: 'Bitcoin' });
        return Promise.resolve(makeSession());
      },
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: false });
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('reports the connection as cancellable while the device waits for the user', async () => {
    const connection = Promise.withResolvers<HardwareWalletSession>();
    const { getValue } = setupSignTx({
      connect(_request, ctx) {
        ctx.onInteraction?.({ type: 'unlock-device' });
        return connection.promise;
      },
    });

    const { signing } = await act(() => ({ signing: getValue().signTransaction() }));

    expect(getValue().awaitingDeviceConnection).toBe(true);
    expect(getValue().isConnectionCancellable).toBe(true);
    expect(getValue().latestDeviceResponse).toMatchObject({ deviceLocked: true });

    await act(async () => {
      connection.resolve(makeSession());
      await signing;
    });

    expect(getValue().awaitingDeviceConnection).toBe(false);
    expect(getValue().isConnectionCancellable).toBe(false);
  });

  test('aborts the running operation when cancelled from the sheet', async () => {
    let capturedCtx: OperationContext | undefined;
    const connection = Promise.withResolvers<HardwareWalletSession>();
    const { getValue, onSuccess } = setupSignTx({
      connect(_request, ctx) {
        capturedCtx = ctx;
        return connection.promise;
      },
    });

    const { signing } = await act(() => ({ signing: getValue().signTransaction() }));
    getValue().cancel();

    expect(capturedCtx?.signal?.aborted).toBe(true);

    await act(async () => {
      connection.reject(new HardwareWalletError('cancelled'));
      await signing;
    });

    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('stays silent when the user cancels while connecting', async () => {
    const { getValue, onSuccess } = setupSignTx({
      connectError: new HardwareWalletError('cancelled'),
    });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(getValue().awaitingDeviceConnection).toBe(false);
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  test('falls back to the generic error step for other failures', async () => {
    const { getValue, onSuccess } = setupSignTx({ signError: new Error('boom') });

    await act(async () => {
      await getValue().signTransaction();
    });

    expect(mocks.toErrorStep).toHaveBeenCalledWith('bitcoin');
    expect(mocks.toConnectStep).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });
});
