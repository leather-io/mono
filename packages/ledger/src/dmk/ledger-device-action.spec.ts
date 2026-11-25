import {
  type DeviceActionState,
  DeviceActionStatus,
  DeviceLockedError,
  type ExecuteDeviceActionReturnType,
  GlobalCommandError,
  RefusedByUserDAError,
  UserInteractionRequired,
} from '@ledgerhq/device-management-kit';
import { Subject, of } from 'rxjs';

import { runLedgerDeviceAction } from './ledger-device-action';
import {
  LedgerConnectionErrors,
  isLedgerDeviceDisconnectedError,
  isLedgerDeviceLockedError,
  isLedgerUserDeniedError,
} from './ledger-dmk-errors';

interface Interaction {
  requiredUserInteraction: string;
}

type FakeState<Output, Error = never, Intermediate = never> = DeviceActionState<
  Output,
  Error,
  Intermediate
>;

function fakeAction<Output, Error = never, Intermediate = never>(
  ...states: FakeState<Output, Error, Intermediate>[]
): ExecuteDeviceActionReturnType<Output, Error, Intermediate> {
  return { observable: of(...states), cancel: vi.fn() };
}

function completed<Output>(output: Output): FakeState<Output> {
  return { status: DeviceActionStatus.Completed, output };
}

function pending(requiredUserInteraction: string): FakeState<never, never, Interaction> {
  return { status: DeviceActionStatus.Pending, intermediateValue: { requiredUserInteraction } };
}

function errored(error: unknown): FakeState<never, unknown> {
  return { status: DeviceActionStatus.Error, error };
}

describe(runLedgerDeviceAction.name, () => {
  test('resolves with the output when the action completes', async () => {
    const { result } = runLedgerDeviceAction(fakeAction(pending('none'), completed('done')));

    await expect(result).resolves.toBe('done');
  });

  test('rejects with an OperationRejected error when the user refuses on the device', async () => {
    const { result } = runLedgerDeviceAction(fakeAction(errored(new RefusedByUserDAError())));

    await expect(result).rejects.toMatchObject({
      name: LedgerConnectionErrors.OperationRejected,
    });
    await expect(result).rejects.toSatisfy(isLedgerUserDeniedError);
  });

  test('rejects with an OperationRejected error for a refused global command', async () => {
    const { result } = runLedgerDeviceAction(
      fakeAction(errored(new GlobalCommandError({ errorCode: '5501', message: 'Action refused' })))
    );

    await expect(result).rejects.toMatchObject({ name: LedgerConnectionErrors.OperationRejected });
  });

  test('rejects with an OperationRejected error for a 6985 app command error', async () => {
    const { result } = runLedgerDeviceAction(
      fakeAction(errored({ _tag: 'BtcAppCommandError', errorCode: '6985', message: 'Rejected' }))
    );

    await expect(result).rejects.toMatchObject({
      name: LedgerConnectionErrors.OperationRejected,
      message: 'Rejected',
    });
  });

  test('keeps locked and disconnected errors recognisable by the existing guards', async () => {
    const locked = runLedgerDeviceAction(fakeAction(errored(new DeviceLockedError()))).result;
    const disconnected = runLedgerDeviceAction(
      fakeAction(errored({ _tag: 'DeviceDisconnectedWhileSendingError' }))
    ).result;

    await expect(locked).rejects.toSatisfy(isLedgerDeviceLockedError);
    await expect(disconnected).rejects.toSatisfy(isLedgerDeviceDisconnectedError);
    await expect(disconnected).rejects.toBeInstanceOf(Error);
    await expect(disconnected).rejects.toMatchObject({
      name: 'DeviceDisconnectedWhileSendingError',
    });
  });

  test('rejects with plain Error instances unchanged', async () => {
    const error = new Error('boom');

    await expect(runLedgerDeviceAction(fakeAction(errored(error))).result).rejects.toBe(error);
  });

  test('reports each distinct required user interaction once', async () => {
    const onRequiredUserInteraction = vi.fn();

    await runLedgerDeviceAction(
      fakeAction(
        pending(UserInteractionRequired.None),
        pending(UserInteractionRequired.RegisterWallet),
        pending(UserInteractionRequired.RegisterWallet),
        pending(UserInteractionRequired.None),
        completed(undefined)
      ),
      { onRequiredUserInteraction }
    ).result;

    expect(onRequiredUserInteraction.mock.calls).toEqual([
      [UserInteractionRequired.None],
      [UserInteractionRequired.RegisterWallet],
      [UserInteractionRequired.None],
    ]);
  });

  test('propagates cancel to the device action and rejects once it stops', async () => {
    const states = new Subject<FakeState<string>>();
    const action: ExecuteDeviceActionReturnType<string, unknown, Interaction> = {
      observable: states.asObservable(),
      cancel: vi.fn(() => {
        states.next({ status: DeviceActionStatus.Stopped });
        states.complete();
      }),
    };

    const handle = runLedgerDeviceAction(action);
    handle.cancel();

    expect(action.cancel).toHaveBeenCalledOnce();
    await expect(handle.result).rejects.toMatchObject({ name: 'LedgerActionCancelled' });
  });

  test('rejects when the action ends without a terminal state', async () => {
    const { result } = runLedgerDeviceAction(fakeAction(pending('none')));

    await expect(result).rejects.toThrow('Ledger device action ended without a result');
  });
});
