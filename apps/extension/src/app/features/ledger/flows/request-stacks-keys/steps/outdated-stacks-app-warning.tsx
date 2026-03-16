import { useLedgerRequestKeysContext } from '@app/features/ledger/generic-flows/request-keys/ledger-request-keys.context';
import { OutdatedStacksAppWarningBase } from '@app/features/ledger/generic-steps';

export function RequestKeyOutdatedStacksAppWarning() {
  const { pullPublicKeysFromDevice } = useLedgerRequestKeysContext();
  return <OutdatedStacksAppWarningBase onTryAgain={pullPublicKeysFromDevice} />;
}
