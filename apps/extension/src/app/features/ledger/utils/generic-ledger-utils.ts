import { useState } from 'react';
import { useLocation } from 'react-router';

import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import BitcoinApp from 'ledger-bitcoin';

import { delay } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';

import { safeAwait } from '@app/common/utils/safe-await';

import { getStacksAppVersion } from './stacks-ledger-utils';

export enum LedgerConnectionErrors {
  AppNotOpen = 'AppNotOpen',
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

async function quitAppOnDevice() {
  const tmpTransport = await TransportWebUSB.create();
  try {
    await quitApp(tmpTransport);
  } finally {
    await closeTransport(tmpTransport);
  }
  // for some reason sending quit app buffer to ledger will close the connection afterwards.
  // we need to add a delay for this transport to properly finish for another one to open.
  await delay(500);
}

export async function promptOpenAppOnDevice(appName: string) {
  const appAndVersion = await getAppAndVersion();
  if (appAndVersion.name === appName) return;

  if (appAndVersion.name !== LEDGER_APPS_MAP.MAIN_MENU) {
    await quitAppOnDevice();
  }

  const tmpTransport = await TransportWebUSB.create();

  try {
    await openApp(tmpTransport, appName);
  } finally {
    await closeTransport(tmpTransport);
  }
  // for some reason sending open app buffer to ledger will close the connection afterwards.
  // we need to add a delay for this transport to properly finish for another one to open.
  await delay(500);
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
