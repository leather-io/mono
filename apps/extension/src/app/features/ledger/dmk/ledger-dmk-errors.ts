import type { SupportedBlockchains } from '@leather.io/models';
import { isError } from '@leather.io/utils';

export enum LedgerConnectionErrors {
  AppNotOpen = 'AppNotOpen',
  AppOpenFailed = 'AppOpenFailed',
  OperationRejected = 'OperationRejected',
}

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

const noDeviceSelectedErrorMessage =
  'Click "Try again" and choose your Ledger in the browser prompt.';
const deviceInUseErrorMessage =
  'Your Ledger is in use by another app. Close Ledger Live and any other Leather windows, then try again.';
const operationRejectedErrorMessage = 'Operation rejected on the Ledger device';

interface DmkTaggedError {
  _tag: string;
  originalError?: unknown;
  message?: unknown;
}

function isDmkTaggedError(error: unknown): error is DmkTaggedError {
  if (typeof error !== 'object' || error === null || !('_tag' in error)) return false;
  return typeof error._tag === 'string';
}

function getNestedError(error: unknown): unknown {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('originalError' in error && error.originalError !== undefined) return error.originalError;
  if ('cause' in error) return error.cause;
  return undefined;
}

function hasTag(error: unknown, tags: readonly string[]): boolean {
  if (isDmkTaggedError(error) && tags.includes(error._tag)) return true;
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

function isLedgerOperationRejectedError(error: unknown): boolean {
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
  const message = isDmkTaggedError(error)
    ? getDmkErrorMessage(error)
    : operationRejectedErrorMessage;
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

function isLedgerTransportFailureError(error: unknown): boolean {
  return isError(error) && error.name === transportFailureErrorName;
}

function isLedgerNoDeviceSelectedError(error: unknown): boolean {
  return hasTag(error, [noDeviceSelectedTag]);
}

function isLedgerDeviceInUseError(error: unknown): boolean {
  return hasTag(error, [deviceInUseTag]);
}

function isLedgerAppOpenFailedError(error: unknown): boolean {
  return isError(error) && error.name === LedgerConnectionErrors.AppOpenFailed;
}

export function isLedgerActionCancelledError(error: unknown): boolean {
  return isError(error) && error.name === ledgerActionCancelledErrorName;
}

export interface LedgerDeviceLockState {
  deviceLocked: boolean;
}

interface LedgerConnectionErrorNavigate {
  toConnectStep(): unknown;
  toErrorStep(chain: SupportedBlockchains, errorMessage?: string): unknown;
  toDeviceDisconnectStep(): unknown;
  toOperationRejectedStep(description?: string): unknown;
}

interface HandleLedgerConnectionErrorArgs {
  chain: SupportedBlockchains;
  ledgerNavigate: LedgerConnectionErrorNavigate;
  setLatestDeviceResponse(response: LedgerDeviceLockState): void;
}

export function handleLedgerConnectionError(
  error: unknown,
  { chain, ledgerNavigate, setLatestDeviceResponse }: HandleLedgerConnectionErrorArgs
): void {
  if (isLedgerActionCancelledError(error)) return;

  if (isLedgerDeviceLockedError(error)) {
    setLatestDeviceResponse({ deviceLocked: true });
    void ledgerNavigate.toConnectStep();
    return;
  }

  if (isError(error) && isLedgerAppOpenFailedError(error)) {
    void ledgerNavigate.toErrorStep(chain, error.message);
    return;
  }

  if (isLedgerDeviceDisconnectedError(error)) {
    void ledgerNavigate.toDeviceDisconnectStep();
    return;
  }

  if (isLedgerOperationRejectedError(error)) {
    void ledgerNavigate.toOperationRejectedStep();
    return;
  }

  if (isLedgerNoDeviceSelectedError(error)) {
    void ledgerNavigate.toErrorStep(chain, noDeviceSelectedErrorMessage);
    return;
  }

  if (isLedgerDeviceInUseError(error)) {
    void ledgerNavigate.toErrorStep(chain, deviceInUseErrorMessage);
    return;
  }

  if (isLedgerTransportFailureError(error)) {
    void ledgerNavigate.toDeviceDisconnectStep();
    return;
  }

  void ledgerNavigate.toErrorStep(chain);
}
