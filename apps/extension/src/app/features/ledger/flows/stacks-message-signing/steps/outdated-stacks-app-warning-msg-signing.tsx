import { useContext } from 'react';

import { OutdatedStacksAppWarningBase } from '@app/features/ledger/generic-steps';

import { ledgerMsgSigningContext } from '../ledger-stacks-sign-msg.context';

export function OutdatedStacksAppWarningMsgSigning() {
  const { signMessage, onCancelMessageSigning } = useContext(ledgerMsgSigningContext);
  return (
    <OutdatedStacksAppWarningBase onTryAgain={signMessage} onCancel={onCancelMessageSigning} />
  );
}
