import {
  type DeviceActionIntermediateValue,
  type DeviceManagementKit,
  type DeviceSessionId,
  type DiscoveredDevice,
  GetAppAndVersionCommand,
  type GetAppAndVersionResponse,
  OpenAppDeviceAction,
  isSuccessCommandResult,
} from '@ledgerhq/device-management-kit';
import { filter, firstValueFrom, timeout } from 'rxjs';

import { safeAwait } from '@app/common/utils/safe-await';

import { type LedgerDeviceActionOptions, runLedgerDeviceAction } from './ledger-device-action';
import { ledgerTransportIdentifier } from './ledger-dmk';
import {
  LedgerConnectionErrors,
  isLedgerDeviceDisconnectedError,
  isLedgerDeviceLockedError,
  toLedgerTransportError,
} from './ledger-dmk-errors';

const grantedDeviceLookupTimeoutMs = 500;
const openAppUnlockTimeoutMs = 60_000;
const postRefreshEmissionIndex = 1;

export type ConnectLedgerDeviceOptions = LedgerDeviceActionOptions<DeviceActionIntermediateValue>;

async function findGrantedDevice(dmk: DeviceManagementKit): Promise<DiscoveredDevice | null> {
  const [, devices] = await safeAwait(
    firstValueFrom(
      dmk.listenToAvailableDevices({ transport: ledgerTransportIdentifier }).pipe(
        filter(
          (availableDevices, index) =>
            availableDevices.length > 0 || index >= postRefreshEmissionIndex
        ),
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
  appName: string,
  options: ConnectLedgerDeviceOptions
): Promise<void> {
  const action = dmk.executeDeviceAction({
    sessionId,
    deviceAction: new OpenAppDeviceAction({
      input: { appName, unlockTimeout: openAppUnlockTimeoutMs },
    }),
  });

  try {
    await runLedgerDeviceAction(action, options).result;
  } catch (error) {
    throw toOpenAppError(error, appName);
  }
}

export async function connectLedgerDeviceToApp(
  dmk: DeviceManagementKit,
  appName: string | null,
  options: ConnectLedgerDeviceOptions = {}
): Promise<DeviceSessionId> {
  const sessionId = await connectLedgerDevice(dmk);
  if (appName === null) return sessionId;
  try {
    await openLedgerApp(dmk, sessionId, appName, options);
  } catch (error) {
    await safeAwait(dmk.disconnect({ sessionId }));
    throw error;
  }
  return sessionId;
}

export async function getAppAndVersion(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId
): Promise<GetAppAndVersionResponse> {
  const result = await dmk.sendCommand({ sessionId, command: new GetAppAndVersionCommand() });
  if (!isSuccessCommandResult(result)) throw toLedgerTransportError(result.error);
  return result.data;
}
