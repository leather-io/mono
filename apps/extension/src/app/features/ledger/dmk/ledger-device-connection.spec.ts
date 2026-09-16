import {
  DeviceActionStatus,
  DeviceLockedError,
  DeviceManagementKit,
  DeviceModel,
  DeviceModelId,
  type DiscoveredDevice,
  GlobalCommandError,
  type OpenAppDAState,
  UnknownDAError,
  UserInteractionRequired,
} from '@ledgerhq/device-management-kit';
import { of } from 'rxjs';

import { LedgerConnectionErrors } from '../utils/generic-ledger-utils';
import { connectLedgerDeviceToApp } from './ledger-device-connection';
import { isLedgerDeviceLockedError } from './ledger-dmk-errors';

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
function makeFakeDmk({
  grantedDevices = [],
  openAppStates = [completedState],
}: FakeDmkOptions = {}) {
  const dmk: DeviceManagementKit = Object.create(DeviceManagementKit.prototype);
  dmk.listenToAvailableDevices = vi.fn().mockReturnValue(of(grantedDevices));
  dmk.startDiscovering = vi.fn().mockReturnValue(of(device));
  dmk.stopDiscovering = vi.fn().mockResolvedValue(undefined);
  dmk.connect = vi.fn().mockResolvedValue(sessionId);
  dmk.disconnect = vi.fn().mockResolvedValue(undefined);
  dmk.executeDeviceAction = vi.fn().mockReturnValue({
    observable: of(...openAppStates),
    cancel: vi.fn(),
  });
  return dmk;
}

describe(connectLedgerDeviceToApp.name, () => {
  test('connects to an already granted device without prompting', async () => {
    const dmk = makeFakeDmk({ grantedDevices: [device] });

    const result = await connectLedgerDeviceToApp(dmk, null);

    expect(result).toBe(sessionId);
    expect(dmk.startDiscovering).not.toHaveBeenCalled();
    expect(dmk.connect).toHaveBeenCalledWith({
      device,
      sessionRefresherOptions: { isRefresherDisabled: true },
    });
  });

  test('falls back to the device chooser when no device has been granted', async () => {
    const dmk = makeFakeDmk();

    await connectLedgerDeviceToApp(dmk, null);

    expect(dmk.startDiscovering).toHaveBeenCalledOnce();
    expect(dmk.stopDiscovering).toHaveBeenCalledOnce();
    expect(dmk.connect).toHaveBeenCalledWith(expect.objectContaining({ device }));
  });

  test('skips opening an app when no app name is given', async () => {
    const dmk = makeFakeDmk({ grantedDevices: [device] });

    await connectLedgerDeviceToApp(dmk, null);

    expect(dmk.executeDeviceAction).not.toHaveBeenCalled();
  });

  test('opens the requested app and resolves once the device action completes', async () => {
    const dmk = makeFakeDmk({
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

  test('rejects with an AppOpenFailed error when the user refuses on the device', async () => {
    const dmk = makeFakeDmk({
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
    const dmk = makeFakeDmk({
      grantedDevices: [device],
      openAppStates: [{ status: DeviceActionStatus.Error, error: lockedError }],
    });

    await expect(connectLedgerDeviceToApp(dmk, 'Stacks')).rejects.toBe(lockedError);
    expect(isLedgerDeviceLockedError(lockedError)).toBe(true);
  });

  test('disconnects the session and rethrows when opening the app fails', async () => {
    const dmk = makeFakeDmk({
      grantedDevices: [device],
      openAppStates: [{ status: DeviceActionStatus.Error, error: new UnknownDAError() }],
    });

    await expect(connectLedgerDeviceToApp(dmk, 'Stacks')).rejects.toMatchObject({
      name: LedgerConnectionErrors.AppOpenFailed,
    });
    expect(dmk.disconnect).toHaveBeenCalledWith({ sessionId });
  });
});
