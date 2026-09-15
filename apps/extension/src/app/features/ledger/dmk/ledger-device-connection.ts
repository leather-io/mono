import {
  DeviceActionStatus,
  type DeviceManagementKit,
  type DeviceSessionId,
  type DiscoveredDevice,
  OpenAppDeviceAction,
} from '@ledgerhq/device-management-kit';
import { filter, firstValueFrom, timeout } from 'rxjs';

import { safeAwait } from '@app/common/utils/safe-await';

import { LedgerConnectionErrors } from '../utils/generic-ledger-utils';
import { ledgerTransportIdentifier } from './ledger-dmk';
import { isLedgerDeviceDisconnectedError, isLedgerDeviceLockedError } from './ledger-dmk-errors';

const grantedDeviceLookupTimeoutMs = 500;
const failFastWhenLockedUnlockTimeoutMs = 500;

async function findGrantedDevice(dmk: DeviceManagementKit): Promise<DiscoveredDevice | null> {
  const [, devices] = await safeAwait(
    firstValueFrom(
      dmk.listenToAvailableDevices({ transport: ledgerTransportIdentifier }).pipe(
        filter(availableDevices => availableDevices.length > 0),
        timeout(grantedDeviceLookupTimeoutMs)
      )
    )
  );
  return devices?.[0] ?? null;
}

async function discoverDevice(dmk: DeviceManagementKit): Promise<DiscoveredDevice> {
  try {
    return await firstValueFrom(dmk.startDiscovering({ transport: ledgerTransportIdentifier }));
  } finally {
    await dmk.stopDiscovering();
  }
}

async function connectLedgerDevice(dmk: DeviceManagementKit): Promise<DeviceSessionId> {
  const device = (await findGrantedDevice(dmk)) ?? (await discoverDevice(dmk));
  return dmk.connect({ device, sessionRefresherOptions: { isRefresherDisabled: true } });
}

function makeAppOpenFailedError(appName: string) {
  const error = new Error(
    `Unable to open the ${appName} app on your Ledger. Make sure it is installed on the device, approve any prompt shown there, then try again.`
  );
  error.name = LedgerConnectionErrors.AppOpenFailed;
  return error;
}

function toOpenAppError(error: unknown, appName: string): unknown {
  if (isLedgerDeviceLockedError(error) || isLedgerDeviceDisconnectedError(error)) return error;
  return makeAppOpenFailedError(appName);
}

async function openLedgerApp(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId,
  appName: string
): Promise<void> {
  const { observable } = dmk.executeDeviceAction({
    sessionId,
    deviceAction: new OpenAppDeviceAction({
      input: { appName, unlockTimeout: failFastWhenLockedUnlockTimeoutMs },
    }),
  });

  const finalState = await firstValueFrom(
    observable.pipe(
      filter(
        state =>
          state.status === DeviceActionStatus.Completed || state.status === DeviceActionStatus.Error
      )
    ),
    { defaultValue: null }
  );

  if (finalState === null) throw makeAppOpenFailedError(appName);
  if (finalState.status === DeviceActionStatus.Error)
    throw toOpenAppError(finalState.error, appName);
}

export async function connectLedgerDeviceToApp(
  dmk: DeviceManagementKit,
  appName: string | null
): Promise<DeviceSessionId> {
  const sessionId = await connectLedgerDevice(dmk);
  if (appName === null) return sessionId;
  try {
    await openLedgerApp(dmk, sessionId, appName);
  } catch (error) {
    await safeAwait(dmk.disconnect({ sessionId }));
    throw error;
  }
  return sessionId;
}
