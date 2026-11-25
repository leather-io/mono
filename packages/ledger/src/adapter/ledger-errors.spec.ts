import { LedgerError } from '@zondax/ledger-stacks';

import { HardwareWalletError } from '../contract/hardware-wallet-errors';
import {
  LedgerConnectionErrors,
  ledgerActionCancelledErrorName,
  makeLedgerDeviceNotPairedError,
} from '../dmk/ledger-dmk-errors';
import {
  deviceInUseErrorMessage,
  ensureStacksAppResponseSucceeded,
  noDeviceSelectedErrorMessage,
  toLedgerHardwareWalletError,
  toStacksAppResponseError,
} from './ledger-errors';

const unknownTransportReturnCode = 0xffff;
const lockedDeviceReturnCode = 0x5515;

function thrownBy(fn: () => void): unknown {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error;
  }
}

function namedError(name: string) {
  return Object.assign(new Error(name), { name });
}

describe(toLedgerHardwareWalletError.name, () => {
  test.each([
    [{ _tag: 'DeviceLockedError' }, 'locked'],
    [{ _tag: 'DeviceDisconnectedWhileSendingError' }, 'disconnected'],
    [namedError('LedgerTransportFailure'), 'disconnected'],
    [{ _tag: 'RefusedByUserDAError' }, 'rejected'],
    [{ statusCode: 0x6985 }, 'rejected'],
    [namedError(LedgerConnectionErrors.OperationRejected), 'rejected'],
    [makeLedgerDeviceNotPairedError(), 'not-paired'],
    [{ _tag: 'NoAccessibleDeviceError' }, 'no-device-selected'],
    [{ _tag: 'ConnectionOpeningError' }, 'busy'],
    [namedError(LedgerConnectionErrors.AppOpenFailed), 'wrong-app'],
    [namedError(ledgerActionCancelledErrorName), 'cancelled'],
    [new Error('something else'), 'unknown'],
  ])('maps %o to %s', (error, kind) => {
    const mapped = toLedgerHardwareWalletError(error);

    expect(mapped).toBeInstanceOf(HardwareWalletError);
    expect(mapped.kind).toBe(kind);
    expect(mapped.cause).toBe(error);
  });

  test('keeps the app-open failure message', () => {
    const error = Object.assign(new Error('Unable to open the Bitcoin Test app on your Ledger.'), {
      name: LedgerConnectionErrors.AppOpenFailed,
    });

    expect(toLedgerHardwareWalletError(error).message).toBe(error.message);
  });

  test('explains a dismissed device chooser and a device in use', () => {
    expect(toLedgerHardwareWalletError({ _tag: 'NoAccessibleDeviceError' }).message).toBe(
      noDeviceSelectedErrorMessage
    );
    expect(toLedgerHardwareWalletError({ _tag: 'ConnectionOpeningError' }).message).toBe(
      deviceInUseErrorMessage
    );
  });

  test('returns hardware wallet errors unchanged', () => {
    const error = new HardwareWalletError('busy');

    expect(toLedgerHardwareWalletError(error)).toBe(error);
  });
});

describe(toStacksAppResponseError.name, () => {
  test.each([
    [LedgerError.DataIsInvalid, 'invalid-payload'],
    [LedgerError.TransactionRejected, 'rejected'],
    [LedgerError.UnknownError, 'unknown'],
  ])('maps return code %s to %s', (returnCode, kind) => {
    const response = { returnCode, errorMessage: 'App said no' };

    const error = toStacksAppResponseError(response);

    expect(error.kind).toBe(kind);
    expect(error.message).toBe('App said no');
    expect(error.cause).toMatchObject({ message: 'App said no' });
  });

  test('routes a transport failure response to disconnected', () => {
    const error = toStacksAppResponseError({
      returnCode: unknownTransportReturnCode,
      errorMessage: 'Device Management Kit failed to send APDU',
    });

    expect(error.kind).toBe('disconnected');
  });

  test('routes a locked device response to locked', () => {
    const error = toStacksAppResponseError({
      returnCode: lockedDeviceReturnCode,
      errorMessage: 'Device is locked',
    });

    expect(error.kind).toBe('locked');
  });
});

describe(ensureStacksAppResponseSucceeded.name, () => {
  test('passes successful responses and throws on failures', () => {
    expect(() =>
      ensureStacksAppResponseSucceeded({ returnCode: LedgerError.NoErrors, errorMessage: '' })
    ).not.toThrow();
    expect(
      thrownBy(() =>
        ensureStacksAppResponseSucceeded({
          returnCode: LedgerError.TransactionRejected,
          errorMessage: 'rejected',
        })
      )
    ).toMatchObject({ kind: 'rejected' });
  });
});
