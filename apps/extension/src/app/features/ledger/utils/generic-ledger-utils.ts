import { useState } from 'react';
import { useLocation } from 'react-router';

import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import BitcoinApp from '@ledgerhq/ledger-bitcoin';

import { delay, isError } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';

import { safeAwait } from '@app/common/utils/safe-await';

import { getStacksAppVersion } from './stacks-ledger-utils';

export enum LedgerConnectionErrors {
  AppNotOpen = 'AppNotOpen',
  AppOpenFailed = 'AppOpenFailed',
  DeviceLocked = 'DeviceLocked',
}

export const LEDGER_APPS_MAP = {
  STACKS: 'Stacks',
  BITCOIN_MAINNET: 'Bitcoin',
  BITCOIN_TESTNET: 'Bitcoin Test',
  MAIN_MENU: 'BOLOS',
} as const;

export const LEDGER_LIVE_MANAGER_URL = 'ledgerlive://manager';

export type LatestDeviceResponse = null | Awaited<ReturnType<typeof getStacksAppVersion>>;

export interface BaseLedgerOperationContext {
  latestDeviceResponse: LatestDeviceResponse;
  awaitingDeviceConnection: boolean;
}

export function useLedgerResponseState() {
  return useState<LatestDeviceResponse>(null);
}

export type SemVerObject = Record<'major' | 'minor' | 'patch', number>;

export function versionObjectToVersionString(version: SemVerObject) {
  return [version.major, version.minor, version.patch].join('.');
}

export interface PrepareLedgerDeviceConnectionArgs {
  setLoadingState(loadingState: boolean): void;
  onError(error?: Error): void;
}
export function prepareLedgerDeviceForAppFn<T extends () => Promise<unknown>>(connectAppFn: T) {
  return async (args: PrepareLedgerDeviceConnectionArgs) => {
    const { setLoadingState, onError } = args;
    setLoadingState(true);
    const [error, app] = await safeAwait(connectAppFn());
    await delay(1000);
    setLoadingState(false);

    if (error || !app) {
      onError(error);
      throw new Error('Unable to initiate Ledger app');
    }

    return app;
  };
}

type TransportInstance = Awaited<ReturnType<typeof TransportWebUSB.create>>;

const deviceReenumerationPollIntervalMs = 100;
const deviceReenumerationTimeoutMs = 5_000;
const appRelaunchSettleDelayMs = 500;

// Reference: https://github.com/LedgerHQ/ledger-live/blob/v22.0.1/src/hw/quitApp.ts
async function quitApp(transport: TransportInstance): Promise<void> {
  await transport.send(0xb0, 0xa7, 0x00, 0x00);
}

// Reference: https://github.com/LedgerHQ/ledger-live/blob/v22.0.1/src/hw/openApp.ts
async function openApp(transport: TransportInstance, name: string): Promise<void> {
  await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, 'ascii'));
}

async function closeTransport(transport: TransportInstance): Promise<void> {
  try {
    await transport.close();
  } catch {
    logger.warn('Failed to close transport connection to Ledger device');
  }
}

async function getAppAndVersion() {
  const tmpTransport = await TransportWebUSB.create();
  try {
    const tmpBitcoinApp = new BitcoinApp(tmpTransport);
    const appAndVersion = await tmpBitcoinApp.getAppAndVersion();
    return appAndVersion;
  } finally {
    await closeTransport(tmpTransport);
  }
}

function isDeviceDisconnectedError(error: unknown): boolean {
  if (!isError(error)) return false;
  return (
    error.name === 'DisconnectedDevice' ||
    error.name === 'DisconnectedDeviceDuringOperation' ||
    error.message.toLowerCase().includes('disconnect')
  );
}

async function waitForDeviceReenumeration(staleDevice: unknown) {
  const maxPollAttempts = deviceReenumerationTimeoutMs / deviceReenumerationPollIntervalMs;
  for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
    const devices = await TransportWebUSB.list();
    if (devices.some(device => device !== staleDevice)) return;
    await delay(deviceReenumerationPollIntervalMs);
  }
}

async function switchAppOnDevice(sendSwitchApdu: (transport: TransportInstance) => Promise<void>) {
  const [staleDevice] = await TransportWebUSB.list();
  const tmpTransport = await TransportWebUSB.create();

  try {
    await sendSwitchApdu(tmpTransport);
  } catch (error) {
    if (!isDeviceDisconnectedError(error)) {
      await closeTransport(tmpTransport);
      throw error;
    }
  }

  await waitForDeviceReenumeration(staleDevice);
  await delay(appRelaunchSettleDelayMs);
}

async function quitAppOnDevice() {
  await switchAppOnDevice(transport => quitApp(transport));
}

export async function promptOpenAppOnDevice(appName: string) {
  const appAndVersion = await getAppAndVersion();
  if (appAndVersion.name === appName) {
    await delay(500);
    return;
  }

  if (appAndVersion.name !== LEDGER_APPS_MAP.MAIN_MENU) {
    await quitAppOnDevice();
  }

  try {
    await switchAppOnDevice(transport => openApp(transport, appName));
  } catch {
    const error = new Error(
      `Unable to open the ${appName} app on your Ledger. Make sure it is installed on the device, approve any prompt shown there, then try again.`
    );
    error.name = LedgerConnectionErrors.AppOpenFailed;
    throw error;
  }
}

export function checkLockedDeviceError(e: Error) {
  return !!(
    e?.name === 'LockedDeviceError' ||
    e?.message?.includes('LockedDeviceError') ||
    e?.message === LedgerConnectionErrors.DeviceLocked
  );
}

function useIsLedgerActionCancellable(): boolean {
  const { pathname } = useLocation();
  return (
    pathname.includes(RouteUrls.ConnectLedger) ||
    pathname.includes(RouteUrls.ConnectLedgerError) ||
    pathname.includes(RouteUrls.AwaitingDeviceUserAction) ||
    pathname.includes(RouteUrls.LedgerStacksAddressStandard)
  );
}

export function useCancelLedgerAction(awaitingDeviceConnection: boolean): boolean {
  const canUserCancelAction = useIsLedgerActionCancellable();

  return !awaitingDeviceConnection && canUserCancelAction;
}
