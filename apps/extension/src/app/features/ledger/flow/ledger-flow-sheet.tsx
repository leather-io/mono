import { useEffect } from 'react';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';

import { useScrollLock } from '@app/common/hooks/use-scroll-lock';

import { LedgerBroadcastError } from '../generic-steps/broadcast-error/broadcast-error';
import { CheckingAppVersion } from '../generic-steps/checking-app-version/checking-app-version';
import { ConnectLedgerError } from '../generic-steps/connect-device/connect-ledger-error';
import { ConnectLedgerSuccessLayout } from '../generic-steps/connect-device/connect-ledger-success.layout';
import { DeviceBusy } from '../generic-steps/device-busy/device-busy';
import { LedgerDeviceInvalidPayload } from '../generic-steps/invalid-payload/device-invalid-payload';
import { LedgerDisconnected } from '../generic-steps/ledger-disconnected/ledger-disconnected';
import { OperationRejected } from '../generic-steps/operation-rejected/operation-rejected';
import { LedgerPublicKeyMismatch } from '../generic-steps/public-key-mismatch/public-key-mismatch';
import { AnimatedStep } from './animated-step';
import { useLedgerFlowState } from './ledger-flow.context';
import type { LedgerStep } from './ledger-flow.types';

type LedgerStepOverrideName =
  | 'connect'
  | 'awaiting-device-operation'
  | 'outdated-stacks-app'
  | 'choose-address-standard';

export type LedgerStepOverrides = Partial<Record<LedgerStepOverrideName, React.ReactNode>>;

function renderLedgerStep(step: LedgerStep, overrides: LedgerStepOverrides) {
  switch (step.name) {
    case 'connect':
      return overrides.connect ?? null;
    case 'awaiting-device-operation':
      return overrides['awaiting-device-operation'] ?? null;
    case 'outdated-stacks-app':
      return overrides['outdated-stacks-app'] ?? null;
    case 'choose-address-standard':
      return overrides['choose-address-standard'] ?? null;
    case 'checking-app-version':
      return <CheckingAppVersion />;
    case 'device-busy':
      return <DeviceBusy description={step.description} address={step.address} />;
    case 'connection-error':
      return <ConnectLedgerError chain={step.chain} errorMessage={step.errorMessage} />;
    case 'connection-success':
      return <ConnectLedgerSuccessLayout chain={step.chain} />;
    case 'public-key-mismatch':
      return <LedgerPublicKeyMismatch />;
    case 'payload-invalid':
      return <LedgerDeviceInvalidPayload />;
    case 'operation-rejected':
      return <OperationRejected description={step.description} />;
    case 'disconnected':
      return <LedgerDisconnected />;
    case 'broadcast-error':
      return <LedgerBroadcastError error={step.error} />;
  }
}

interface LedgerFlowSheetProps {
  onClose?(): void;
  renderStep?: LedgerStepOverrides;
}
export function LedgerFlowSheet({ onClose, renderStep = {} }: LedgerFlowSheetProps) {
  const state = useLedgerFlowState();
  useScrollLock(true);

  const flowKind = state?.request.kind;
  const stepName = state?.step.name;

  useEffect(() => {
    if (!flowKind || !stepName) return;
    analytics.page('view', `/ledger/${flowKind}/${stepName}`);
  }, [flowKind, stepName]);

  if (!state) return null;

  return (
    <Sheet isShowing header={<SheetHeader />} onClose={onClose}>
      <AnimatedStep stepName={state.step.name}>
        {renderLedgerStep(state.step, renderStep)}
      </AnimatedStep>
    </Sheet>
  );
}
