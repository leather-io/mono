import { LedgerFlowSheet, type LedgerStepOverrides } from '../../flow/ledger-flow-sheet';
import { useLedgerFlow } from '../../flow/ledger-flow.context';
import { RequestKeyOutdatedStacksAppWarning } from '../../flows/request-stacks-keys/steps/outdated-stacks-app-warning';
import { LedgerRequestKeysContext, LedgerRequestKeysProvider } from './ledger-request-keys.context';
import { ConnectLedgerRequestKeys } from './steps/connect-ledger-request-keys';

interface RequestKeysFlowProps {
  context: LedgerRequestKeysContext;
  isActionCancellableByUser: boolean;
  onCancelAction?(): void;
  renderStep?: LedgerStepOverrides;
}
export function RequestKeysFlow({
  context,
  isActionCancellableByUser,
  onCancelAction,
  renderStep,
}: RequestKeysFlowProps) {
  const { close } = useLedgerFlow();

  function onCancelConnectLedger() {
    onCancelAction?.();
    close();
  }

  return (
    <LedgerRequestKeysProvider value={context}>
      <LedgerFlowSheet
        onClose={isActionCancellableByUser ? onCancelConnectLedger : undefined}
        renderStep={{
          connect: <ConnectLedgerRequestKeys />,
          'outdated-stacks-app': <RequestKeyOutdatedStacksAppWarning />,
          ...renderStep,
        }}
      />
    </LedgerRequestKeysProvider>
  );
}
