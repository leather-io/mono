import { useContext } from 'react';

import { OutdatedStacksAppWarningBase } from '@app/features/ledger/generic-steps';

import { ledgerJwtSigningContext } from '../ledger-sign-jwt.context';

export function OutdatedStacksAppWarningJwtSigning() {
  const { signJwtPayload } = useContext(ledgerJwtSigningContext);
  return <OutdatedStacksAppWarningBase onTryAgain={signJwtPayload} />;
}
