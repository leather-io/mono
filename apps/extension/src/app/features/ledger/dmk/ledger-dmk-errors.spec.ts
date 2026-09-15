import { LedgerConnectionErrors } from '../utils/generic-ledger-utils';
import {
  isLedgerAppOpenFailedError,
  isLedgerDeviceDisconnectedError,
  isLedgerDeviceLockedError,
  isLedgerNoDeviceSelectedError,
  isLedgerUserDeniedError,
} from './ledger-dmk-errors';

function makeNamedError(name: string) {
  const error = new Error(name);
  error.name = name;
  return error;
}

describe(isLedgerDeviceLockedError.name, () => {
  test.each([
    ['a DMK tagged locked error', { _tag: 'DeviceLockedError' }],
    ['a transport status error with the locked status code', { statusCode: 0x5515 }],
    ['a DMK command error with the locked error code', { errorCode: '5515' }],
    ['a legacy LockedDeviceError', makeNamedError('LockedDeviceError')],
  ])('is true for %s', (_, error) => {
    expect(isLedgerDeviceLockedError(error)).toBe(true);
  });

  test.each([
    ['a plain error', new Error('boom')],
    ['a different tag', { _tag: 'DeviceDisconnectedWhileSendingError' }],
    ['a different status code', { statusCode: 0x6985 }],
    ['null', null],
  ])('is false for %s', (_, error) => {
    expect(isLedgerDeviceLockedError(error)).toBe(false);
  });
});

describe(isLedgerUserDeniedError.name, () => {
  test('matches the device denial status code', () => {
    expect(isLedgerUserDeniedError({ statusCode: 0x6985 })).toBe(true);
  });

  test('does not match other device status codes', () => {
    expect(isLedgerUserDeniedError({ statusCode: 0x6a80 })).toBe(false);
    expect(isLedgerUserDeniedError(makeNamedError('LockedDeviceError'))).toBe(false);
  });

  test('does not match errors that merely mention the status code', () => {
    expect(isLedgerUserDeniedError(new Error('Ledger device: UNKNOWN_ERROR (0x6985)'))).toBe(false);
    expect(isLedgerUserDeniedError(undefined)).toBe(false);
  });
});

describe(isLedgerDeviceDisconnectedError.name, () => {
  test.each([
    'DeviceDisconnectedWhileSendingError',
    'DeviceDisconnectedBeforeSendingApdu',
    'DeviceSessionNotFound',
  ])('is true for the %s tag', tag => {
    expect(isLedgerDeviceDisconnectedError({ _tag: tag })).toBe(true);
  });

  test('is false for errors without a disconnect tag', () => {
    expect(isLedgerDeviceDisconnectedError(new Error('disconnect'))).toBe(false);
  });
});

describe(isLedgerNoDeviceSelectedError.name, () => {
  test.each(['NoAccessibleDeviceError', 'ConnectionOpeningError'])(
    'is true for the %s tag',
    tag => {
      expect(isLedgerNoDeviceSelectedError({ _tag: tag })).toBe(true);
    }
  );

  test('is false for a plain error', () => {
    expect(isLedgerNoDeviceSelectedError(new Error('boom'))).toBe(false);
  });
});

describe(isLedgerAppOpenFailedError.name, () => {
  test('is true only for errors named AppOpenFailed', () => {
    expect(isLedgerAppOpenFailedError(makeNamedError(LedgerConnectionErrors.AppOpenFailed))).toBe(
      true
    );
    expect(isLedgerAppOpenFailedError({ _tag: 'UnknownDAError' })).toBe(false);
  });
});
