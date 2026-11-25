import { LedgerError, type ResponseBase } from '@zondax/ledger-stacks';

import { isError } from '@leather.io/utils';

import {
  HardwareWalletError,
  isHardwareWalletError,
  toHardwareWalletError,
} from '../contract/hardware-wallet-errors';
import {
  isLedgerActionCancelledError,
  isLedgerAppOpenFailedError,
  isLedgerDeviceDisconnectedError,
  isLedgerDeviceInUseError,
  isLedgerDeviceLockedError,
  isLedgerDeviceNotPairedError,
  isLedgerNoDeviceSelectedError,
  isLedgerOperationRejectedError,
  isLedgerTransportFailureError,
  isLedgerUserDeniedError,
  isLedgerUserRefusedDeviceActionError,
  makeLedgerAppResponseError,
} from '../dmk/ledger-dmk-errors';
import { hasLedgerReturnCode } from '../stacks/stacks-ledger-utils';

export const noDeviceSelectedErrorMessage =
  'Click "Try again" and choose your Ledger in the browser prompt.';
export const deviceInUseErrorMessage =
  'Your Ledger is in use by another app. Close Ledger Live and any other Leather windows, then try again.';

function messageOf(error: unknown): string | undefined {
  return isError(error) ? error.message : undefined;
}

export function toLedgerHardwareWalletError(error: unknown): HardwareWalletError {
  if (isHardwareWalletError(error)) return error;
  if (isLedgerActionCancelledError(error))
    return new HardwareWalletError('cancelled', { cause: error });
  if (isLedgerDeviceLockedError(error)) return new HardwareWalletError('locked', { cause: error });
  if (isLedgerDeviceDisconnectedError(error) || isLedgerTransportFailureError(error))
    return new HardwareWalletError('disconnected', { cause: error });
  if (
    isLedgerOperationRejectedError(error) ||
    isLedgerUserDeniedError(error) ||
    isLedgerUserRefusedDeviceActionError(error)
  )
    return new HardwareWalletError('rejected', { cause: error });
  if (isLedgerDeviceNotPairedError(error))
    return new HardwareWalletError('not-paired', { cause: error });
  if (isLedgerNoDeviceSelectedError(error))
    return new HardwareWalletError('no-device-selected', {
      message: noDeviceSelectedErrorMessage,
      cause: error,
    });
  if (isLedgerDeviceInUseError(error))
    return new HardwareWalletError('busy', { message: deviceInUseErrorMessage, cause: error });
  if (isLedgerAppOpenFailedError(error))
    return new HardwareWalletError('wrong-app', { message: messageOf(error), cause: error });
  return toHardwareWalletError(error);
}

export function toStacksAppResponseError(response: ResponseBase): HardwareWalletError {
  const cause = makeLedgerAppResponseError(response);
  if (hasLedgerReturnCode(response, LedgerError.DataIsInvalid))
    return new HardwareWalletError('invalid-payload', { message: response.errorMessage, cause });
  if (hasLedgerReturnCode(response, LedgerError.TransactionRejected))
    return new HardwareWalletError('rejected', { message: response.errorMessage, cause });
  return toLedgerHardwareWalletError(cause);
}

export function ensureStacksAppResponseSucceeded(response: ResponseBase): void {
  if (!hasLedgerReturnCode(response, LedgerError.NoErrors))
    throw toStacksAppResponseError(response);
}
