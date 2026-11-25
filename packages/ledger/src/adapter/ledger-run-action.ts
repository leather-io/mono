import { type RunLedgerDeviceAction, runLedgerDeviceAction } from '../dmk/ledger-device-action';

export function makeAbortableRunAction(signal: AbortSignal | undefined): RunLedgerDeviceAction {
  return (action, options) => {
    const handle = runLedgerDeviceAction(action, options);
    if (signal?.aborted) {
      handle.cancel();
    } else {
      signal?.addEventListener('abort', () => handle.cancel(), { once: true });
    }
    return handle.result;
  };
}
