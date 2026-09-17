import { useState } from 'react';
import { useLocation } from 'react-router';

import { UserInteractionRequired } from '@ledgerhq/device-management-kit';

import { delay } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { safeAwait } from '@app/common/utils/safe-await';

import type { LedgerDeviceLockState } from '../dmk/ledger-dmk-errors';

export const LEDGER_APPS_MAP = {
  STACKS: 'Stacks',
  BITCOIN_MAINNET: 'Bitcoin',
  BITCOIN_TESTNET: 'Bitcoin Test',
  MAIN_MENU: 'BOLOS',
} as const;

export const LEDGER_LIVE_MANAGER_URL = 'ledgerlive://manager';

export type LatestDeviceResponse = null | LedgerDeviceLockState;

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

interface PrepareLedgerDeviceConnectionArgs {
  setLoadingState(loadingState: boolean): void;
  onError(error?: Error): void;
}
export function prepareLedgerDeviceForAppFn<App>(connectAppFn: () => Promise<App>) {
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

function useIsLedgerActionCancellable(): boolean {
  const { pathname } = useLocation();
  return (
    pathname.includes(RouteUrls.ConnectLedger) ||
    pathname.includes(RouteUrls.ConnectLedgerError) ||
    pathname.includes(RouteUrls.AwaitingDeviceUserAction) ||
    pathname.includes(RouteUrls.LedgerStacksAddressStandard)
  );
}

const cancellableConnectionInteractions: readonly string[] = [
  UserInteractionRequired.UnlockDevice,
  UserInteractionRequired.ConfirmOpenApp,
];

export function isCancellableConnectionInteraction(interaction: string): boolean {
  return cancellableConnectionInteractions.includes(interaction);
}

interface UseCancelLedgerActionArgs {
  awaitingDeviceConnection: boolean;
  isConnectionCancellable: boolean;
}
export function useCancelLedgerAction({
  awaitingDeviceConnection,
  isConnectionCancellable,
}: UseCancelLedgerActionArgs): boolean {
  const canUserCancelAction = useIsLedgerActionCancellable();

  return (!awaitingDeviceConnection || isConnectionCancellable) && canUserCancelAction;
}
