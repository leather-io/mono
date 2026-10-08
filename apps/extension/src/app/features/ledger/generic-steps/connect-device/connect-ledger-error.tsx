import type { SupportedBlockchains } from '@leather.io/models';

import { capitalize } from '@app/common/utils';
import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';

import { ConnectLedgerErrorLayout } from './connect-ledger-error.layout';

interface ConnectLedgerErrorProps {
  chain: SupportedBlockchains;
  errorMessage?: string;
}
export function ConnectLedgerError({ chain, errorMessage }: ConnectLedgerErrorProps) {
  const ledgerSteps = useLedgerSteps();
  // TODO: here it would be better to use the actual app name from
  // LEDGER_APPS_MAP at src/app/features/ledger/utils/generic-ledger-utils.ts

  const appName = capitalize(chain);
  return (
    <ConnectLedgerErrorLayout
      warningText={errorMessage ?? null}
      appName={appName}
      onTryAgain={() => ledgerSteps.toConnectStepAndTryAgain()}
    />
  );
}
