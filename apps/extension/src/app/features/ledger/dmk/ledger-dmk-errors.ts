import { isError } from '@leather.io/utils';

import { LedgerConnectionErrors } from '../utils/generic-ledger-utils';

const deviceLockedTag = 'DeviceLockedError';
const deviceDisconnectedTags: readonly string[] = [
  'DeviceDisconnectedWhileSendingError',
  'DeviceDisconnectedBeforeSendingApdu',
  'DeviceSessionNotFound',
  'WebHidSendReportError',
];
const noDeviceSelectedTag = 'NoAccessibleDeviceError';
const deviceInUseTag = 'ConnectionOpeningError';

const lockedDeviceStatusCode = 0x5515;
const userDeniedStatusCode = 0x6985;
const legacyLockedDeviceErrorName = 'LockedDeviceError';
const unknownDeviceErrorMessage = 'Unknown Ledger device error';

export const noDeviceSelectedErrorMessage =
  'Click "Try again" and choose your Ledger in the browser prompt.';
export const deviceInUseErrorMessage =
  'Your Ledger is in use by another app. Close Ledger Live and any other Leather windows, then try again.';

interface DmkTaggedError {
  _tag: string;
  originalError?: unknown;
  message?: unknown;
}

function isDmkTaggedError(error: unknown): error is DmkTaggedError {
  if (typeof error !== 'object' || error === null || !('_tag' in error)) return false;
  return typeof error._tag === 'string';
}

function hasTag(error: unknown, tags: readonly string[]): boolean {
  return isDmkTaggedError(error) && tags.includes(error._tag);
}

function hasStatusCode(error: unknown, statusCode: number): boolean {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return false;
  return error.statusCode === statusCode;
}

function hasErrorCode(error: unknown, statusCode: number): boolean {
  if (typeof error !== 'object' || error === null || !('errorCode' in error)) return false;
  return error.errorCode === statusCode.toString(16);
}

function getDmkErrorMessage({ _tag, originalError, message }: DmkTaggedError): string {
  if (typeof message === 'string' && message.length > 0) return message;
  if (isError(originalError) && originalError.message.length > 0) return originalError.message;
  return _tag;
}

export function toLedgerTransportError(error: unknown): Error {
  if (isError(error)) return error;
  if (!isDmkTaggedError(error)) {
    return new Error(typeof error === 'string' ? error : unknownDeviceErrorMessage);
  }
  const transportError = new Error(getDmkErrorMessage(error));
  transportError.name = error._tag;
  return Object.assign(transportError, { _tag: error._tag, originalError: error.originalError });
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
  return hasTag(error, [noDeviceSelectedTag]);
}

export function isLedgerDeviceInUseError(error: unknown): boolean {
  return hasTag(error, [deviceInUseTag]);
}

export function isLedgerAppOpenFailedError(error: unknown): boolean {
  return isError(error) && error.name === LedgerConnectionErrors.AppOpenFailed;
}
