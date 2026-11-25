import { useState } from 'react';

import { useLedgerFlowState } from '../flow/ledger-flow.context';
import type { LedgerStepName } from '../flow/ledger-flow.types';

export const LEDGER_LIVE_MANAGER_URL = 'ledgerlive://manager';

export const defaultNumberOfKeysToPullFromLedgerDevice = 10;

export const registerLedgerWalletPolicyPrompt = 'Approve the Leather wallet policy on your Ledger…';

export interface LedgerDeviceLockState {
  deviceLocked: boolean;
}

export type LatestDeviceResponse = null | LedgerDeviceLockState;

export interface BaseLedgerOperationContext {
  latestDeviceResponse: LatestDeviceResponse;
  awaitingDeviceConnection: boolean;
}

export function useLedgerResponseState() {
  return useState<LatestDeviceResponse>(null);
}

const cancellableLedgerSteps: readonly LedgerStepName[] = [
  'connect',
  'connection-error',
  'pair-device',
  'awaiting-device-operation',
  'choose-address-standard',
];

function useIsLedgerActionCancellable(): boolean {
  const state = useLedgerFlowState();
  return state !== null && cancellableLedgerSteps.includes(state.step.name);
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
