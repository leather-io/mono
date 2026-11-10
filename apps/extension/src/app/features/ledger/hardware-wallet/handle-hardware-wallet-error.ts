import { type HardwareWalletError, isHardwareWalletError } from '@leather.io/ledger';
import type { SupportedBlockchains } from '@leather.io/models';

import type { LedgerStacksAppVersionInfo } from '../flow/ledger-flow.types';
import type { LedgerDeviceLockState } from '../utils/generic-ledger-utils';

interface HardwareWalletErrorNavigate {
  toConnectStep(): unknown;
  toErrorStep(chain: SupportedBlockchains, errorMessage?: string): unknown;
  toDeviceDisconnectStep(): unknown;
  toOperationRejectedStep(description?: string): unknown;
  toPairDeviceStep(): unknown;
  toDevicePayloadInvalid(): unknown;
  toStacksAppOutdatedWarning(versionInfo?: LedgerStacksAppVersionInfo): unknown;
}

interface HandleHardwareWalletErrorArgs {
  chain: SupportedBlockchains;
  ledgerNavigate: HardwareWalletErrorNavigate;
  setLatestDeviceResponse(response: LedgerDeviceLockState): void;
}

function handleKnownError(
  error: HardwareWalletError,
  { chain, ledgerNavigate, setLatestDeviceResponse }: HandleHardwareWalletErrorArgs
): void {
  if (error.kind === 'cancelled') return;

  if (error.kind === 'locked') {
    setLatestDeviceResponse({ deviceLocked: true });
    void ledgerNavigate.toConnectStep();
    return;
  }

  if (error.kind === 'disconnected') {
    void ledgerNavigate.toDeviceDisconnectStep();
    return;
  }

  if (error.kind === 'rejected') {
    void ledgerNavigate.toOperationRejectedStep();
    return;
  }

  if (error.kind === 'not-paired') {
    void ledgerNavigate.toPairDeviceStep();
    return;
  }

  if (error.kind === 'invalid-payload') {
    void ledgerNavigate.toDevicePayloadInvalid();
    return;
  }

  if (error.kind === 'outdated-app') {
    void ledgerNavigate.toStacksAppOutdatedWarning(error.details ?? undefined);
    return;
  }

  if (error.kind === 'unknown') {
    void ledgerNavigate.toErrorStep(chain);
    return;
  }

  void ledgerNavigate.toErrorStep(chain, error.message);
}

export function handleHardwareWalletError(error: unknown, args: HandleHardwareWalletErrorArgs) {
  if (isHardwareWalletError(error)) {
    handleKnownError(error, args);
    return;
  }
  void args.ledgerNavigate.toErrorStep(args.chain);
}
