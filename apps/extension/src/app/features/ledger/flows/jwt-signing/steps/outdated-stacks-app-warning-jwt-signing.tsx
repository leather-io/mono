import { useContext } from 'react';

import { OutdatedStacksAppWarningBase } from '@app/features/ledger/generic-steps';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';

import { ledgerJwtSigningContext } from '../ledger-sign-jwt.context';

export function OutdatedStacksAppWarningJwtSigning() {
  const { signJwtPayload } = useContext(ledgerJwtSigningContext);
  const ledgerNavigate = useLedgerNavigate();
  return (
    <OutdatedStacksAppWarningBase
      onTryAgain={signJwtPayload}
      onCancel={() => void ledgerNavigate.cancelLedgerAction()}
    />
  );
}
