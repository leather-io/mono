import { useContext } from 'react';

import { OutdatedStacksAppWarningBase } from '@app/features/ledger/generic-steps/outdated-stacks-app-warning/outdated-stacks-app-warning-base';

import { ledgerMsgSigningContext } from '../ledger-stacks-sign-msg.context';

export function OutdatedStacksAppWarningMsgSigning() {
  const { signMessage, onCancelMessageSigning } = useContext(ledgerMsgSigningContext);
  return (
    <OutdatedStacksAppWarningBase onTryAgain={signMessage} onCancel={onCancelMessageSigning} />
  );
}
