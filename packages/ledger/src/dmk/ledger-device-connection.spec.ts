import {
  CommandResultFactory,
  DeviceActionStatus,
  DeviceLockedError,
  DeviceModel,
  DeviceModelId,
  type DiscoveredDevice,
  GlobalCommandError,
  type OpenAppDAState,
  UnknownDAError,
  UnknownDeviceExchangeError,
  UserInteractionRequired,
} from '@ledgerhq/device-management-kit';
import { Subject, of } from 'rxjs';

import { connectLedgerDeviceToApp, getAppAndVersion } from './ledger-device-connection';
import {
  LedgerConnectionErrors,
  isLedgerActionCancelledError,
  isLedgerDeviceLockedError,
} from './ledger-dmk-errors';
import { makeFakeDmk } from './ledger-dmk.test-utils';

const sessionId = 'session-1';

const device: DiscoveredDevice = {
  id: 'device-1',
  name: 'Nano S Plus',
  deviceModel: new DeviceModel({
    id: 'nanoSP',
    model: DeviceModelId.NANO_SP,
    name: 'Ledger Nano S Plus',
  }),
  transport: 'WEB-HID',
};

const completedState: OpenAppDAState = {
  status: DeviceActionStatus.Completed,
  output: undefined,
};

const pendingState: OpenAppDAState = {
  status: DeviceActionStatus.Pending,
  intermediateValue: {
    requiredUserInteraction: UserInteractionRequired.ConfirmOpenApp,
    step: 'os.openApp.steps.confirmOpenApp',
  },
};

interface FakeDmkOptions {
  grantedDevices?: DiscoveredDevice[];
  openAppStates?: OpenAppDAState[];
}
function makeConnectingDmk({
  grantedDevices = [],
  openAppStates = [completedState],
}: FakeDmkOptions = {}) {
  const startDiscovering = vi.fn().mockReturnValue(of(device));
  const stopDiscovering = vi.fn().mockResolvedValue(undefined);
  const connect = vi.fn().mockResolvedValue(sessionId);
  const disconnect = vi.fn().mockResolvedValue(undefined);
  const executeDeviceAction = vi.fn().mockReturnValue({
    observable: of(...openAppStates),
    cancel: vi.fn(),
  });
  const dmk = makeFakeDmk({
    listenToAvailableDevices: vi.fn().mockReturnValue(of(grantedDevices)),
    startDiscovering,
    stopDiscovering,
    connect,
    disconnect,
    executeDeviceAction,
  });
  return { dmk, startDiscovering, stopDiscovering, connect, disconnect, executeDeviceAction };
}

function objectContaining(expected: Record<string, unknown>): unknown {
  return expect.objectContaining(expected);
}

function stringContaining(expected: string): unknown {
  return expect.stringContaining(expected);
}

describe(connectLedgerDeviceToApp.name, () => {
  test('connects to an already granted device without prompting', async () => {
    const { dmk, startDiscovering, connect } = makeConnectingDmk({ grantedDevices: [device] });

    const result = await connectLedgerDeviceToApp(dmk, null);

    expect(result).toBe(sessionId);
    expect(startDiscovering).not.toHaveBeenCalled();
    expect(connect).toHaveBeenCalledWith({
      device,
      sessionRefresherOptions: { isRefresherDisabled: true },
    });
  });

  test('falls back to the device chooser when no device has been granted', async () => {
    const { dmk, startDiscovering, stopDiscovering, connect } = makeConnectingDmk();

    await connectLedgerDeviceToApp(dmk, null);

    expect(startDiscovering).toHaveBeenCalledOnce();
    expect(stopDiscovering).toHaveBeenCalledOnce();
    expect(connect).toHaveBeenCalledWith(expect.objectContaining({ device }));
  });

  test('rejects as not paired instead of prompting when the chooser cannot be shown', async () => {
    const { dmk, startDiscovering, connect } = makeConnectingDmk();

    await expect(
      connectLedgerDeviceToApp(dmk, 'Stacks', { canPromptForDevice: false })
    ).rejects.toMatchObject({ name: LedgerConnectionErrors.DeviceNotPaired });

    expect(startDiscovering).not.toHaveBeenCalled();
    expect(connect).not.toHaveBeenCalled();
  });

  test('connects to a granted device when the chooser cannot be shown', async () => {
    const onRequiredUserInteraction = vi.fn();
    const runAction = vi.fn().mockResolvedValue(undefined);
    const { dmk, startDiscovering } = makeConnectingDmk({ grantedDevices: [device] });

    await expect(
      connectLedgerDeviceToApp(dmk, 'Stacks', {
        canPromptForDevice: false,
        onRequiredUserInteraction,
        runAction,
      })
    ).resolves.toBe(sessionId);

    expect(startDiscovering).not.toHaveBeenCalled();
    expect(runAction).toHaveBeenCalledWith(expect.anything(), { onRequiredUserInteraction });
  });

  test('falls back to the device chooser on the post-refresh emission without waiting out the window', async () => {
    const { dmk, startDiscovering } = makeConnectingDmk();
    const availableDevices = new Subject<DiscoveredDevice[]>();
    dmk.listenToAvailableDevices = vi.fn().mockReturnValue(availableDevices);
    const connecting = connectLedgerDeviceToApp(dmk, null);
    availableDevices.next([]);
    availableDevices.next([]);

    await connecting;

    expect(startDiscovering).toHaveBeenCalledOnce();
  });

  test('connects to a device that appears on the post-refresh emission', async () => {
    const { dmk, startDiscovering, connect } = makeConnectingDmk();
    dmk.listenToAvailableDevices = vi.fn().mockReturnValue(of([], [device]));

    await connectLedgerDeviceToApp(dmk, null);

    expect(startDiscovering).not.toHaveBeenCalled();
    expect(connect).toHaveBeenCalledWith(expect.objectContaining({ device }));
  });

  test('skips opening an app when no app name is given', async () => {
    const { dmk, executeDeviceAction } = makeConnectingDmk({ grantedDevices: [device] });

    await connectLedgerDeviceToApp(dmk, null);

    expect(executeDeviceAction).not.toHaveBeenCalled();
  });

  test('opens the requested app and resolves once the device action completes', async () => {
    const { dmk, disconnect, executeDeviceAction } = makeConnectingDmk({
      grantedDevices: [device],
      openAppStates: [pendingState, pendingState, completedState],
    });

    await expect(connectLedgerDeviceToApp(dmk, 'Bitcoin')).resolves.toBe(sessionId);

    expect(executeDeviceAction).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId,
        deviceAction: objectContaining({
          input: objectContaining({ appName: 'Bitcoin' }),
        }),
      })
    );
    expect(disconnect).not.toHaveBeenCalled();
  });

  test('reports the unlock interaction while the open-app action waits for the user', async () => {
    const onRequiredUserInteraction = vi.fn();
    const { dmk, executeDeviceAction } = makeConnectingDmk({
      grantedDevices: [device],
      openAppStates: [
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: {
            requiredUserInteraction: UserInteractionRequired.UnlockDevice,
            step: 'os.openApp.steps.getDeviceStatus',
          },
        },
        pendingState,
        completedState,
      ],
    });

    await connectLedgerDeviceToApp(dmk, 'Bitcoin', { onRequiredUserInteraction });

    expect(onRequiredUserInteraction.mock.calls).toEqual([
      [UserInteractionRequired.UnlockDevice],
      [UserInteractionRequired.ConfirmOpenApp],
    ]);
    expect(executeDeviceAction).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceAction: objectContaining({
          input: objectContaining({ unlockTimeout: 60_000 }),
        }),
      })
    );
  });

  test('runs the open-app action through the supplied runner', async () => {
    const onRequiredUserInteraction = vi.fn();
    const runAction = vi.fn().mockResolvedValue(undefined);
    const { dmk, executeDeviceAction } = makeConnectingDmk({ grantedDevices: [device] });

    await connectLedgerDeviceToApp(dmk, 'Bitcoin', { onRequiredUserInteraction, runAction });

    expect(runAction).toHaveBeenCalledOnce();
    const actionResult: unknown = executeDeviceAction.mock.results[0]?.value;
    expect(runAction).toHaveBeenCalledWith(actionResult, { onRequiredUserInteraction });
  });

  test('passes a cancelled-action error through and disconnects the session', async () => {
    const { dmk, disconnect } = makeConnectingDmk({
      grantedDevices: [device],
      openAppStates: [pendingState, { status: DeviceActionStatus.Stopped }],
    });

    const rejection = connectLedgerDeviceToApp(dmk, 'Bitcoin');

    await expect(rejection).rejects.toSatisfy(isLedgerActionCancelledError);
    expect(disconnect).toHaveBeenCalledWith({ sessionId });
  });

  test('rejects with an AppOpenFailed error when the user refuses on the device', async () => {
    const { dmk } = makeConnectingDmk({
      grantedDevices: [device],
      openAppStates: [
        {
          status: DeviceActionStatus.Error,
          error: new GlobalCommandError({ errorCode: '5501', message: 'Action refused on device' }),
        },
      ],
    });

    await expect(connectLedgerDeviceToApp(dmk, 'Bitcoin Test')).rejects.toMatchObject({
      name: LedgerConnectionErrors.AppOpenFailed,
      message: stringContaining('Bitcoin Test'),
    });
  });

  test('passes a locked-device error through unchanged', async () => {
    const lockedError = new DeviceLockedError();
    const { dmk } = makeConnectingDmk({
      grantedDevices: [device],
      openAppStates: [{ status: DeviceActionStatus.Error, error: lockedError }],
    });

    const rejection = connectLedgerDeviceToApp(dmk, 'Stacks');

    await expect(rejection).rejects.toMatchObject({
      name: 'DeviceLockedError',
      _tag: 'DeviceLockedError',
      originalError: lockedError.originalError,
    });
    await expect(rejection).rejects.toSatisfy(isLedgerDeviceLockedError);
  });

  test('disconnects the session and rethrows when opening the app fails', async () => {
    const { dmk, disconnect } = makeConnectingDmk({
      grantedDevices: [device],
      openAppStates: [{ status: DeviceActionStatus.Error, error: new UnknownDAError() }],
    });

    await expect(connectLedgerDeviceToApp(dmk, 'Stacks')).rejects.toMatchObject({
      name: LedgerConnectionErrors.AppOpenFailed,
    });
    expect(disconnect).toHaveBeenCalledWith({ sessionId });
  });
});

describe(getAppAndVersion.name, () => {
  test('returns the running app name and version from the device', async () => {
    const sendCommand = vi
      .fn()
      .mockResolvedValue(
        CommandResultFactory({ data: { name: 'Bitcoin Test', version: '2.4.1', flags: 0 } })
      );
    const dmk = makeFakeDmk({ sendCommand });

    await expect(getAppAndVersion(dmk, sessionId)).resolves.toEqual({
      name: 'Bitcoin Test',
      version: '2.4.1',
      flags: 0,
    });
    expect(sendCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId,
        command: objectContaining({ name: 'getAppAndVersion' }),
      })
    );
  });

  test('throws a normalised error when the command fails', async () => {
    const dmk = makeFakeDmk({
      sendCommand: vi
        .fn()
        .mockResolvedValue(
          CommandResultFactory({ error: new UnknownDeviceExchangeError('exchange failed') })
        ),
    });

    await expect(getAppAndVersion(dmk, sessionId)).rejects.toMatchObject({
      name: 'UnknownDeviceExchangeError',
    });
  });
});
