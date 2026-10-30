import { z } from 'zod';

import { isError } from '@leather.io/utils';

export const LedgerConnectionErrors = {
  AppNotOpen: 'AppNotOpen',
  AppOpenFailed: 'AppOpenFailed',
  DeviceNotPaired: 'DeviceNotPaired',
  OperationRejected: 'OperationRejected',
} as const;
export type LedgerConnectionErrors =
  (typeof LedgerConnectionErrors)[keyof typeof LedgerConnectionErrors];

const deviceLockedTag = 'DeviceLockedError';
const deviceDisconnectedTags: readonly string[] = [
  'DeviceDisconnectedWhileSendingError',
  'DeviceDisconnectedBeforeSendingApdu',
  'DeviceSessionNotFound',
  'WebHidSendReportError',
];
const noDeviceSelectedTag = 'NoAccessibleDeviceError';
const deviceInUseTag = 'ConnectionOpeningError';
const refusedByUserTag = 'RefusedByUserDAError';

const lockedDeviceStatusCode = 0x5515;
const userDeniedStatusCode = 0x6985;
const actionRefusedStatusCode = 0x5501;
const legacyLockedDeviceErrorName = 'LockedDeviceError';
const unknownDeviceErrorMessage = 'Unknown Ledger device error';
const unknownTransportReturnCode = 0xffff;
const transportFailureErrorName = 'LedgerTransportFailure';

export const ledgerActionCancelledErrorName = 'LedgerActionCancelled';

const operationRejectedErrorMessage = 'Operation rejected on the Ledger device';
const deviceNotPairedErrorMessage =
  'Leather has not been given access to a Ledger device in this browser';

const dmkTaggedErrorSchema = z.object({
  _tag: z.string(),
  originalError: z.unknown().optional(),
  message: z.unknown().optional(),
});
type DmkTaggedError = z.infer<typeof dmkTaggedErrorSchema>;

function parseDmkTaggedError(error: unknown) {
  const result = dmkTaggedErrorSchema.safeParse(error);
  return result.success ? result.data : undefined;
}

function getNestedError(error: unknown): unknown {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('originalError' in error && error.originalError !== undefined) return error.originalError;
  if ('cause' in error) return error.cause;
  return undefined;
}

function hasTag(error: unknown, tags: readonly string[]): boolean {
  const taggedError = parseDmkTaggedError(error);
  if (taggedError && tags.includes(taggedError._tag)) return true;
  const nestedError = getNestedError(error);
  return nestedError !== undefined && nestedError !== error && hasTag(nestedError, tags);
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
  const taggedError = parseDmkTaggedError(error);
  if (!taggedError) {
    return new Error(typeof error === 'string' ? error : unknownDeviceErrorMessage);
  }
  const transportError = new Error(getDmkErrorMessage(taggedError));
  transportError.name = taggedError._tag;
  return Object.assign(transportError, {
    _tag: taggedError._tag,
    originalError: taggedError.originalError,
  });
}

export function isLedgerDeviceLockedError(error: unknown): boolean {
  if (hasTag(error, [deviceLockedTag])) return true;
  if (hasStatusCode(error, lockedDeviceStatusCode)) return true;
  if (hasErrorCode(error, lockedDeviceStatusCode)) return true;
  return isError(error) && error.name === legacyLockedDeviceErrorName;
}

export function isLedgerOperationRejectedError(error: unknown): boolean {
  return isError(error) && error.name === LedgerConnectionErrors.OperationRejected;
}

export function isLedgerUserDeniedError(error: unknown): boolean {
  return hasStatusCode(error, userDeniedStatusCode) || isLedgerOperationRejectedError(error);
}

export function isLedgerUserRefusedDeviceActionError(error: unknown): boolean {
  if (hasTag(error, [refusedByUserTag])) return true;
  return hasErrorCode(error, actionRefusedStatusCode) || hasErrorCode(error, userDeniedStatusCode);
}

export function makeLedgerOperationRejectedError(error: unknown): Error {
  const taggedError = parseDmkTaggedError(error);
  const message = taggedError ? getDmkErrorMessage(taggedError) : operationRejectedErrorMessage;
  const rejectedError = new Error(message);
  rejectedError.name = LedgerConnectionErrors.OperationRejected;
  return Object.assign(rejectedError, { originalError: error });
}

export function isLedgerDeviceDisconnectedError(error: unknown): boolean {
  return hasTag(error, deviceDisconnectedTags);
}

interface LedgerAppErrorResponse {
  returnCode: number;
  errorMessage: string;
  cause?: unknown;
}

export function makeLedgerAppResponseError(response: LedgerAppErrorResponse): Error {
  const error = new Error(response.errorMessage);
  if (response.returnCode !== unknownTransportReturnCode) {
    return Object.assign(error, { statusCode: response.returnCode });
  }
  error.name = transportFailureErrorName;
  return Object.assign(error, { originalError: getNestedError(response) });
}

export function isLedgerTransportFailureError(error: unknown): boolean {
  return isError(error) && error.name === transportFailureErrorName;
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

export function isLedgerActionCancelledError(error: unknown): boolean {
  return isError(error) && error.name === ledgerActionCancelledErrorName;
}

export function makeLedgerDeviceNotPairedError(): Error {
  const error = new Error(deviceNotPairedErrorMessage);
  error.name = LedgerConnectionErrors.DeviceNotPaired;
  return error;
}

export function isLedgerDeviceNotPairedError(error: unknown): boolean {
  return isError(error) && error.name === LedgerConnectionErrors.DeviceNotPaired;
}
