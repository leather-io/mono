import { createContext } from 'react';

import { noop } from '@leather.io/utils';

import { type UnsignedMessage } from '@shared/signature/signature-types';

import { type BaseLedgerOperationContext } from '../../utils/generic-ledger-utils';

export interface LedgerMessageSigningContext extends BaseLedgerOperationContext {
  message: UnsignedMessage | undefined;
  signMessage: () => Promise<void> | void;
  onCancelMessageSigning: () => void;
}

export const ledgerMsgSigningContext = createContext<LedgerMessageSigningContext>({
  message: undefined,
  latestDeviceResponse: null,
  awaitingDeviceConnection: false,
  signMessage: noop,
  onCancelMessageSigning: noop,
});

export const LedgerMsgSigningProvider = ledgerMsgSigningContext.Provider;
