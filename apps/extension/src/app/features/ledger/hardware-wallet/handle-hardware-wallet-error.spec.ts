import { HardwareWalletError } from '@leather.io/ledger';

import { handleHardwareWalletError } from './handle-hardware-wallet-error';

function makeNavigate() {
  return {
    toConnectStep: vi.fn(),
    toErrorStep: vi.fn(),
    toDeviceDisconnectStep: vi.fn(),
    toOperationRejectedStep: vi.fn(),
    toPairDeviceStep: vi.fn(),
    toDevicePayloadInvalid: vi.fn(),
    toStacksAppOutdatedWarning: vi.fn(),
  };
}

function dispatch(error: unknown) {
  const ledgerNavigate = makeNavigate();
  const setLatestDeviceResponse = vi.fn();
  handleHardwareWalletError(error, { chain: 'bitcoin', ledgerNavigate, setLatestDeviceResponse });
  return { ledgerNavigate, setLatestDeviceResponse };
}

describe(handleHardwareWalletError.name, () => {
  test('marks the device locked and returns to the connect step', () => {
    const { ledgerNavigate, setLatestDeviceResponse } = dispatch(new HardwareWalletError('locked'));

    expect(setLatestDeviceResponse).toHaveBeenCalledWith({ deviceLocked: true });
    expect(ledgerNavigate.toConnectStep).toHaveBeenCalledOnce();
    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
  });

  test('surfaces the wrong-app message on the error step', () => {
    const error = new HardwareWalletError('wrong-app', { message: 'Unable to open the app' });
    const { ledgerNavigate } = dispatch(error);

    expect(ledgerNavigate.toErrorStep).toHaveBeenCalledWith('bitcoin', error.message);
  });

  test('routes disconnects to the disconnected step', () => {
    const { ledgerNavigate } = dispatch(new HardwareWalletError('disconnected'));

    expect(ledgerNavigate.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
  });

  test('routes rejections to the operation rejected step', () => {
    const { ledgerNavigate } = dispatch(new HardwareWalletError('rejected'));

    expect(ledgerNavigate.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
  });

  test('explains a dismissed device chooser and a device in use', () => {
    const chooserError = new HardwareWalletError('no-device-selected', { message: 'Choose it' });
    const busyError = new HardwareWalletError('busy', { message: 'In use' });

    expect(dispatch(chooserError).ledgerNavigate.toErrorStep).toHaveBeenCalledWith(
      'bitcoin',
      'Choose it'
    );
    expect(dispatch(busyError).ledgerNavigate.toErrorStep).toHaveBeenCalledWith(
      'bitcoin',
      'In use'
    );
  });

  test('routes an unpaired device to the pairing step', () => {
    const { ledgerNavigate } = dispatch(new HardwareWalletError('not-paired'));

    expect(ledgerNavigate.toPairDeviceStep).toHaveBeenCalledOnce();
    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
  });

  test('routes an invalid payload to the payload step', () => {
    const { ledgerNavigate } = dispatch(new HardwareWalletError('invalid-payload'));

    expect(ledgerNavigate.toDevicePayloadInvalid).toHaveBeenCalledOnce();
  });

  test('routes an outdated app to the update warning with the version details', () => {
    const details = { currentVersion: '0.26.17', requiredVersion: '0.26.19' };
    const { ledgerNavigate } = dispatch(new HardwareWalletError('outdated-app', { details }));

    expect(ledgerNavigate.toStacksAppOutdatedWarning).toHaveBeenCalledWith(details);
  });

  test('does nothing for a cancelled operation', () => {
    const { ledgerNavigate, setLatestDeviceResponse } = dispatch(
      new HardwareWalletError('cancelled')
    );

    expect(ledgerNavigate.toErrorStep).not.toHaveBeenCalled();
    expect(ledgerNavigate.toConnectStep).not.toHaveBeenCalled();
    expect(setLatestDeviceResponse).not.toHaveBeenCalled();
  });

  test('falls back to the generic error step for unknown and foreign errors', () => {
    expect(
      dispatch(new HardwareWalletError('unknown', { message: 'boom' })).ledgerNavigate.toErrorStep
    ).toHaveBeenCalledWith('bitcoin');
    expect(dispatch(new Error('boom')).ledgerNavigate.toErrorStep).toHaveBeenCalledWith('bitcoin');
  });
});
