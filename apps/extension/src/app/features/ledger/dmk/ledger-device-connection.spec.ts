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
import { LedgerConnectionErrors, isLedgerDeviceLockedError } from './ledger-dmk-errors';
import { makeFakeDmk } from './ledger-dmk.mocks';

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
  return makeFakeDmk({
    listenToAvailableDevices: vi.fn().mockReturnValue(of(grantedDevices)),
    startDiscovering: vi.fn().mockReturnValue(of(device)),
    connect: vi.fn().mockResolvedValue(sessionId),
    executeDeviceAction: vi.fn().mockReturnValue({
      observable: of(...openAppStates),
      cancel: vi.fn(),
    }),
  });
}

describe(connectLedgerDeviceToApp.name, () => {
  test('connects to an already granted device without prompting', async () => {
    const dmk = makeConnectingDmk({ grantedDevices: [device] });

    const result = await connectLedgerDeviceToApp(dmk, null);

    expect(result).toBe(sessionId);
    expect(dmk.startDiscovering).not.toHaveBeenCalled();
    expect(dmk.connect).toHaveBeenCalledWith({
      device,
      sessionRefresherOptions: { isRefresherDisabled: true },
    });
  });

  test('falls back to the device chooser when no device has been granted', async () => {
    const dmk = makeConnectingDmk();

    await connectLedgerDeviceToApp(dmk, null);

    expect(dmk.startDiscovering).toHaveBeenCalledOnce();
    expect(dmk.stopDiscovering).toHaveBeenCalledOnce();
    expect(dmk.connect).toHaveBeenCalledWith(expect.objectContaining({ device }));
  });

  test('falls back to the device chooser on the post-refresh emission without waiting out the window', async () => {
    const dmk = makeConnectingDmk();
    const availableDevices = new Subject<DiscoveredDevice[]>();
    dmk.listenToAvailableDevices = vi.fn().mockReturnValue(availableDevices);
    const connecting = connectLedgerDeviceToApp(dmk, null);
    availableDevices.next([]);
    availableDevices.next([]);

    await connecting;

    expect(dmk.startDiscovering).toHaveBeenCalledOnce();
  });

  test('connects to a device that appears on the post-refresh emission', async () => {
    const dmk = makeConnectingDmk();
    dmk.listenToAvailableDevices = vi.fn().mockReturnValue(of([], [device]));

    await connectLedgerDeviceToApp(dmk, null);

    expect(dmk.startDiscovering).not.toHaveBeenCalled();
    expect(dmk.connect).toHaveBeenCalledWith(expect.objectContaining({ device }));
  });

  test('skips opening an app when no app name is given', async () => {
    const dmk = makeConnectingDmk({ grantedDevices: [device] });

    await connectLedgerDeviceToApp(dmk, null);

    expect(dmk.executeDeviceAction).not.toHaveBeenCalled();
  });

  test('opens the requested app and resolves once the device action completes', async () => {
    const dmk = makeConnectingDmk({
      grantedDevices: [device],
      openAppStates: [pendingState, pendingState, completedState],
    });

    await expect(connectLedgerDeviceToApp(dmk, 'Bitcoin')).resolves.toBe(sessionId);

    expect(dmk.executeDeviceAction).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId,
        deviceAction: expect.objectContaining({
          input: expect.objectContaining({ appName: 'Bitcoin' }),
        }),
      })
    );
    expect(dmk.disconnect).not.toHaveBeenCalled();
  });

  test('reports the unlock interaction while the open-app action waits for the user', async () => {
    const onRequiredUserInteraction = vi.fn();
    const dmk = makeConnectingDmk({
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
    expect(dmk.executeDeviceAction).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceAction: expect.objectContaining({
          input: expect.objectContaining({ unlockTimeout: 60_000 }),
        }),
      })
    );
  });

  test('rejects with an AppOpenFailed error when the user refuses on the device', async () => {
    const dmk = makeConnectingDmk({
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
      message: expect.stringContaining('Bitcoin Test'),
    });
  });

  test('passes a locked-device error through unchanged', async () => {
    const lockedError = new DeviceLockedError();
    const dmk = makeConnectingDmk({
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
    const dmk = makeConnectingDmk({
      grantedDevices: [device],
      openAppStates: [{ status: DeviceActionStatus.Error, error: new UnknownDAError() }],
    });

    await expect(connectLedgerDeviceToApp(dmk, 'Stacks')).rejects.toMatchObject({
      name: LedgerConnectionErrors.AppOpenFailed,
    });
    expect(dmk.disconnect).toHaveBeenCalledWith({ sessionId });
  });
});

describe(getAppAndVersion.name, () => {
  test('returns the running app name and version from the device', async () => {
    const dmk = makeFakeDmk({
      sendCommand: vi
        .fn()
        .mockResolvedValue(
          CommandResultFactory({ data: { name: 'Bitcoin Test', version: '2.4.1', flags: 0 } })
        ),
    });

    await expect(getAppAndVersion(dmk, sessionId)).resolves.toEqual({
      name: 'Bitcoin Test',
      version: '2.4.1',
      flags: 0,
    });
    expect(dmk.sendCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId,
        command: expect.objectContaining({ name: 'getAppAndVersion' }),
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
