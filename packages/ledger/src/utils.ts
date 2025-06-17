import { delay } from '@leather.io/utils';

import { LedgerConnectionErrors } from './types';

export const LEDGER_APPS_MAP = {
  BITCOIN_MAINNET: 'Bitcoin',
  BITCOIN_TESTNET: 'Bitcoin Test',
  STACKS: 'Stacks',
} as const;

export async function promptOpenAppOnDevice(appName: string): Promise<void> {
  // This is a placeholder for the actual implementation
  // In the extension, this would show a UI prompt
  await delay(1000);
}

export function checkLockedDeviceError(error: Error): boolean {
  return error.message.includes(LedgerConnectionErrors.DeviceLocked);
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
