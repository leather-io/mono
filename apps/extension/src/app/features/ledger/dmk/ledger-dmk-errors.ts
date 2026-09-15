import { isError } from '@leather.io/utils';

import { LedgerConnectionErrors } from '../utils/generic-ledger-utils';

const deviceLockedTag = 'DeviceLockedError';
const deviceDisconnectedTags: readonly string[] = [
  'DeviceDisconnectedWhileSendingError',
  'DeviceDisconnectedBeforeSendingApdu',
  'DeviceSessionNotFound',
];
const noDeviceSelectedTags: readonly string[] = [
  'NoAccessibleDeviceError',
  'DeviceNotRecognizedError',
  'ConnectionOpeningError',
  'UnknownDeviceError',
];

const lockedDeviceStatusCode = 0x5515;
const userDeniedStatusCode = 0x6985;
const legacyLockedDeviceErrorName = 'LockedDeviceError';

export const noDeviceSelectedErrorMessage =
  'Click "Try again" and choose your Ledger in the browser prompt.';

function hasTag(error: unknown, tags: readonly string[]): boolean {
  if (typeof error !== 'object' || error === null || !('_tag' in error)) return false;
  return typeof error._tag === 'string' && tags.includes(error._tag);
}

function hasStatusCode(error: unknown, statusCode: number): boolean {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return false;
  return error.statusCode === statusCode;
}

function hasErrorCode(error: unknown, statusCode: number): boolean {
  if (typeof error !== 'object' || error === null || !('errorCode' in error)) return false;
  return error.errorCode === statusCode.toString(16);
}

export function isLedgerDeviceLockedError(error: unknown): boolean {
  if (hasTag(error, [deviceLockedTag])) return true;
  if (hasStatusCode(error, lockedDeviceStatusCode)) return true;
  if (hasErrorCode(error, lockedDeviceStatusCode)) return true;
  return isError(error) && error.name === legacyLockedDeviceErrorName;
}

export function isLedgerUserDeniedError(error: unknown): boolean {
  return hasStatusCode(error, userDeniedStatusCode);
}

export function isLedgerDeviceDisconnectedError(error: unknown): boolean {
  return hasTag(error, deviceDisconnectedTags);
}

export function isLedgerNoDeviceSelectedError(error: unknown): boolean {
  return hasTag(error, noDeviceSelectedTags);
}

export function isLedgerAppOpenFailedError(error: unknown): boolean {
  return isError(error) && error.name === LedgerConnectionErrors.AppOpenFailed;
}
