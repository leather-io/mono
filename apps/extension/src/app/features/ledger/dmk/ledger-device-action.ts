import {
  type DeviceActionIntermediateValue,
  DeviceActionStatus,
  type ExecuteDeviceActionReturnType,
} from '@ledgerhq/device-management-kit';

import {
  isLedgerUserRefusedDeviceActionError,
  ledgerActionCancelledErrorName,
  makeLedgerOperationRejectedError,
  toLedgerTransportError,
} from './ledger-dmk-errors';

export interface LedgerDeviceActionOptions<Intermediate extends DeviceActionIntermediateValue> {
  onRequiredUserInteraction?(interaction: Intermediate['requiredUserInteraction']): void;
}

export interface LedgerDeviceActionHandle<Output> {
  result: Promise<Output>;
  cancel(): void;
}

export type RunLedgerDeviceAction = <
  Output,
  Error,
  Intermediate extends DeviceActionIntermediateValue,
>(
  action: ExecuteDeviceActionReturnType<Output, Error, Intermediate>,
  options?: LedgerDeviceActionOptions<Intermediate>
) => Promise<Output>;

function toLedgerDeviceActionError(error: unknown): Error {
  if (isLedgerUserRefusedDeviceActionError(error)) return makeLedgerOperationRejectedError(error);
  return toLedgerTransportError(error);
}

function makeActionCancelledError(): Error {
  const error = new Error('Ledger device action was cancelled');
  error.name = ledgerActionCancelledErrorName;
  return error;
}

export function runLedgerDeviceAction<
  Output,
  Error,
  Intermediate extends DeviceActionIntermediateValue,
>(
  action: ExecuteDeviceActionReturnType<Output, Error, Intermediate>,
  { onRequiredUserInteraction }: LedgerDeviceActionOptions<Intermediate> = {}
): LedgerDeviceActionHandle<Output> {
  const result = new Promise<Output>((resolve, reject) => {
    let lastInteraction: Intermediate['requiredUserInteraction'] | null = null;
    let settled = false;

    action.observable.subscribe({
      next(state) {
        if (state.status === DeviceActionStatus.Pending) {
          const interaction = state.intermediateValue.requiredUserInteraction;
          if (interaction === lastInteraction) return;
          lastInteraction = interaction;
          onRequiredUserInteraction?.(interaction);
          return;
        }
        if (state.status === DeviceActionStatus.Completed) {
          settled = true;
          resolve(state.output);
          return;
        }
        if (state.status === DeviceActionStatus.Error) {
          settled = true;
          reject(toLedgerDeviceActionError(state.error));
          return;
        }
        if (state.status === DeviceActionStatus.Stopped) {
          settled = true;
          reject(makeActionCancelledError());
        }
      },
      error(error: unknown) {
        settled = true;
        reject(toLedgerDeviceActionError(error));
      },
      complete() {
        if (!settled) reject(new Error('Ledger device action ended without a result'));
      },
    });
  });

  return {
    result,
    cancel() {
      action.cancel();
    },
  };
}

export function runLedgerDeviceActionToCompletion<
  Output,
  Error,
  Intermediate extends DeviceActionIntermediateValue,
>(
  action: ExecuteDeviceActionReturnType<Output, Error, Intermediate>,
  options?: LedgerDeviceActionOptions<Intermediate>
): Promise<Output> {
  return runLedgerDeviceAction(action, options).result;
}
