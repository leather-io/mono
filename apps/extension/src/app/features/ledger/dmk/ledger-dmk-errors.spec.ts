import {
  LedgerConnectionErrors,
  handleLedgerConnectionError,
  isLedgerActionCancelledError,
  isLedgerDeviceDisconnectedError,
  isLedgerDeviceLockedError,
  isLedgerUserDeniedError,
  isLedgerUserRefusedDeviceActionError,
  makeLedgerAppResponseError,
  makeLedgerOperationRejectedError,
  toLedgerTransportError,
} from './ledger-dmk-errors';

const unknownTransportReturnCode = 0xffff;
const transportFailureMessage =
  'Device Management Kit failed to send APDU: DeviceDisconnectedWhileSendingError';

const noDeviceSelectedErrorMessage =
  'Click "Try again" and choose your Ledger in the browser prompt.';
const deviceInUseErrorMessage =
  'Your Ledger is in use by another app. Close Ledger Live and any other Leather windows, then try again.';

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

  test('matches errors named OperationRejected', () => {
    expect(isLedgerUserDeniedError(makeNamedError(LedgerConnectionErrors.OperationRejected))).toBe(
      true
    );
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

describe(isLedgerUserRefusedDeviceActionError.name, () => {
  test.each([
    ['a refused-by-user device action error', { _tag: 'RefusedByUserDAError' }],
    ['a 5501 command error', { _tag: 'GlobalCommandError', errorCode: '5501' }],
    ['a 6985 command error', { _tag: 'BtcAppCommandError', errorCode: '6985' }],
  ])('is true for %s', (_, error) => {
    expect(isLedgerUserRefusedDeviceActionError(error)).toBe(true);
  });

  test('is false for locked and disconnected errors', () => {
    expect(isLedgerUserRefusedDeviceActionError({ _tag: 'DeviceLockedError' })).toBe(false);
    expect(isLedgerUserRefusedDeviceActionError({ errorCode: '5515' })).toBe(false);
  });
});

describe(makeLedgerOperationRejectedError.name, () => {
  test('builds an Error the denial guards recognise and keeps the device message', () => {
    const error = makeLedgerOperationRejectedError({
      _tag: 'BtcAppCommandError',
      errorCode: '6985',
      message: 'Rejected by user',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(LedgerConnectionErrors.OperationRejected);
    expect(error.message).toBe('Rejected by user');
    expect(isLedgerUserDeniedError(error)).toBe(true);
  });

  test('falls back to a generic message for untagged errors', () => {
    expect(makeLedgerOperationRejectedError(undefined).message).toBe(
      'Operation rejected on the Ledger device'
    );
  });
});

describe(makeLedgerAppResponseError.name, () => {
  test('keeps the device error message for app-level error codes', () => {
    const error = makeLedgerAppResponseError({ returnCode: 0x6f00, errorMessage: 'Unknown error' });

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Unknown error');
    expect(error.name).toBe('Error');
    expect(isLedgerDeviceDisconnectedError(error)).toBe(false);
  });

  test('preserves the DMK cause of a transport failure so the disconnect guard matches', () => {
    const error = makeLedgerAppResponseError({
      returnCode: unknownTransportReturnCode,
      errorMessage: transportFailureMessage,
      cause: { _tag: 'DeviceDisconnectedWhileSendingError' },
    });

    expect(error.message).toBe(transportFailureMessage);
    expect(error).toMatchObject({
      originalError: { _tag: 'DeviceDisconnectedWhileSendingError' },
    });
    expect(isLedgerDeviceDisconnectedError(error)).toBe(true);
  });

  test('still marks a transport failure when the cause was dropped', () => {
    const error = makeLedgerAppResponseError({
      returnCode: unknownTransportReturnCode,
      errorMessage: transportFailureMessage,
    });

    expect(error.name).toBe('LedgerTransportFailure');
    expect(isLedgerDeviceDisconnectedError(error)).toBe(false);
  });
});

describe(isLedgerActionCancelledError.name, () => {
  test('is true only for errors named LedgerActionCancelled', () => {
    expect(isLedgerActionCancelledError(makeNamedError('LedgerActionCancelled'))).toBe(true);
    expect(isLedgerActionCancelledError(new Error('LedgerActionCancelled'))).toBe(false);
  });
});

describe(isLedgerDeviceDisconnectedError.name, () => {
  test.each([
    'DeviceDisconnectedWhileSendingError',
    'DeviceDisconnectedBeforeSendingApdu',
    'DeviceSessionNotFound',
    'WebHidSendReportError',
  ])('is true for the %s tag', tag => {
    expect(isLedgerDeviceDisconnectedError({ _tag: tag })).toBe(true);
  });

  test('is true for a normalised disconnect error', () => {
    const error = toLedgerTransportError({ _tag: 'DeviceDisconnectedWhileSendingError' });
    expect(isLedgerDeviceDisconnectedError(error)).toBe(true);
  });

  test('is true when the tag is nested under the error cause', () => {
    const wrapped = Object.assign(new Error('Device Management Kit failed to send APDU'), {
      cause: { _tag: 'DeviceDisconnectedWhileSendingError' },
    });
    expect(isLedgerDeviceDisconnectedError(wrapped)).toBe(true);
  });

  test('is false for errors without a disconnect tag', () => {
    expect(isLedgerDeviceDisconnectedError(new Error('disconnect'))).toBe(false);
  });
});

describe(toLedgerTransportError.name, () => {
  test('returns Error instances unchanged', () => {
    const error = new Error('boom');
    expect(toLedgerTransportError(error)).toBe(error);
  });

  test('wraps a tagged DMK error into an Error that keeps the tag and original error', () => {
    const originalError = new Error('HID send failed');
    const error = toLedgerTransportError({ _tag: 'WebHidSendReportError', originalError });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('WebHidSendReportError');
    expect(error.message).toBe('HID send failed');
    expect(error).toMatchObject({ _tag: 'WebHidSendReportError', originalError });
  });

  test('prefers the DMK error message when present', () => {
    const error = toLedgerTransportError({
      _tag: 'UnknownDeviceExchangeError',
      message: 'Device exchange failed',
    });
    expect(error.message).toBe('Device exchange failed');
  });

  test('falls back to the tag when there is no message', () => {
    const error = toLedgerTransportError({ _tag: 'DeviceSessionNotFound' });
    expect(error.message).toBe('DeviceSessionNotFound');
  });

  test('wraps untagged rejections into a readable Error', () => {
    expect(toLedgerTransportError('device gone').message).toBe('device gone');
    expect(toLedgerTransportError({}).message).toBe('Unknown Ledger device error');
    expect(toLedgerTransportError(undefined).message).toBe('Unknown Ledger device error');
  });
});

describe(handleLedgerConnectionError.name, () => {
  function makeNavigate() {
    return {
      toConnectStep: vi.fn(),
      toErrorStep: vi.fn(),
      toDeviceDisconnectStep: vi.fn(),
      toOperationRejectedStep: vi.fn(),
    };
  }

  function dispatch(error: unknown) {
    const ledgerNavigate = makeNavigate();
    const setLatestDeviceResponse = vi.fn();
    handleLedgerConnectionError(error, {
      chain: 'bitcoin',
      ledgerNavigate,
      setLatestDeviceResponse,
    });
    return { ledgerNavigate, setLatestDeviceResponse };
  }

  test('marks the device locked and returns to the connect step', () => {
    const { ledgerNavigate, setLatestDeviceResponse } = dispatch({ _tag: 'DeviceLockedError' });

    expect(setLatestDeviceResponse).toHaveBeenCalledWith({ deviceLocked: true });
    expect(ledgerNavigate.toConnectStep).toHaveBeenCalledOnce();
    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
  });

  test('surfaces the app-open failure message', () => {
    const error = makeNamedError(LedgerConnectionErrors.AppOpenFailed);
    const { ledgerNavigate } = dispatch(error);

    expect(ledgerNavigate.toErrorStep).toHaveBeenCalledWith('bitcoin', error.message);
  });

  test('routes disconnects to the disconnected step', () => {
    const { ledgerNavigate } = dispatch({ _tag: 'DeviceSessionNotFound' });

    expect(ledgerNavigate.toDeviceDisconnectStep).toHaveBeenCalledOnce();
  });

  test('routes a transport failure with a disconnect cause to the disconnected step', () => {
    const { ledgerNavigate } = dispatch(
      makeLedgerAppResponseError({
        returnCode: unknownTransportReturnCode,
        errorMessage: transportFailureMessage,
        cause: { _tag: 'DeviceDisconnectedWhileSendingError' },
      })
    );

    expect(ledgerNavigate.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
  });

  test('routes a transport failure without a cause to the disconnected step', () => {
    const { ledgerNavigate } = dispatch(
      makeLedgerAppResponseError({
        returnCode: unknownTransportReturnCode,
        errorMessage: transportFailureMessage,
      })
    );

    expect(ledgerNavigate.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
  });

  test('routes an app-level error response to the generic error step', () => {
    const { ledgerNavigate } = dispatch(
      makeLedgerAppResponseError({ returnCode: 0x6f00, errorMessage: 'Unknown error' })
    );

    expect(ledgerNavigate.toErrorStep).toHaveBeenCalledWith('bitcoin');
    expect(ledgerNavigate.toDeviceDisconnectStep).not.toHaveBeenCalled();
  });

  test('routes rejections to the operation rejected step', () => {
    const { ledgerNavigate } = dispatch(makeNamedError(LedgerConnectionErrors.OperationRejected));

    expect(ledgerNavigate.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
  });

  test('explains a cancelled device chooser and a device in use', () => {
    expect(
      dispatch({ _tag: 'NoAccessibleDeviceError' }).ledgerNavigate.toErrorStep
    ).toHaveBeenCalledWith('bitcoin', noDeviceSelectedErrorMessage);
    expect(
      dispatch({ _tag: 'ConnectionOpeningError' }).ledgerNavigate.toErrorStep
    ).toHaveBeenCalledWith('bitcoin', deviceInUseErrorMessage);
  });

  test('does nothing for a cancelled action', () => {
    const { ledgerNavigate, setLatestDeviceResponse } = dispatch(
      makeNamedError('LedgerActionCancelled')
    );

    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
    expect(ledgerNavigate.toConnectStep).not.toHaveBeenCalled();
    expect(setLatestDeviceResponse).not.toHaveBeenCalled();
  });

  test('falls back to the generic error step', () => {
    const { ledgerNavigate } = dispatch(new Error('boom'));

    expect(ledgerNavigate.toErrorStep).toHaveBeenCalledWith('bitcoin');
  });
});
