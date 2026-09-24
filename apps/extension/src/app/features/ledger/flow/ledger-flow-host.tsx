import * as Sentry from '@sentry/react';

import { isError } from '@leather.io/utils';

import { logger } from '@shared/logger';

import { useToast } from '@app/features/toasts/use-toast';

import { LedgerDmkProvider } from '../dmk/ledger-dmk.context';
import { LedgerSignBitcoinTxContainer } from '../flows/bitcoin-tx-signing/ledger-bitcoin-sign-tx-container';
import { LedgerConfirmBtcPolicyAddress } from '../flows/confirm-btc-policy-address/ledger-confirm-btc-policy-address';
import { LedgerRequestBitcoinKeys } from '../flows/request-bitcoin-keys/ledger-request-bitcoin-keys';
import { LedgerRequestStacksKeys } from '../flows/request-stacks-keys/ledger-request-stacks-keys';
import { LedgerSignMsgContainer } from '../flows/stacks-message-signing/ledger-stacks-sign-msg-container';
import { LedgerSignStacksTxContainer } from '../flows/stacks-tx-signing/ledger-sign-stacks-tx-container';
import { LedgerVerifyBtcAddress } from '../flows/verify-address/ledger-verify-btc-address';
import { LedgerVerifyStxAddress } from '../flows/verify-address/ledger-verify-stx-address';
import { ConnectLedgerStart } from '../generic-steps/connect-device/connect-ledger-start';
import { UnsupportedBrowserLayout } from '../generic-steps/unsupported-browser/unsupported-browser.layout';
import { useLedgerFlow } from './ledger-flow.context';
import type { ActiveLedgerFlowRequest } from './ledger-flow.types';

const ledgerFlowRenderErrorMessage = 'Ledger flow failed to render';

function renderLedgerFlow(request: ActiveLedgerFlowRequest, close: () => void) {
  switch (request.kind) {
    case 'sign-bitcoin-tx':
      return <LedgerSignBitcoinTxContainer request={request} />;
    case 'sign-stacks-tx':
      return <LedgerSignStacksTxContainer request={request} />;
    case 'sign-stacks-message':
      return <LedgerSignMsgContainer request={request} />;
    case 'request-keys':
      return request.chain === 'stacks' ? (
        <LedgerRequestStacksKeys />
      ) : (
        <LedgerRequestBitcoinKeys />
      );
    case 'verify-address':
      return request.variant === 'stx' ? (
        <LedgerVerifyStxAddress />
      ) : (
        <LedgerVerifyBtcAddress variant={request.variant} />
      );
    case 'confirm-btc-policy-address':
      return <LedgerConfirmBtcPolicyAddress request={request} />;
    case 'connect-start':
      return <ConnectLedgerStart />;
    case 'unsupported-browser':
      return <UnsupportedBrowserLayout onClose={close} />;
  }
}

export function LedgerFlowHost() {
  const { request, close, closeWithError } = useLedgerFlow();
  const toast = useToast();

  if (!request) return null;

  return (
    <Sentry.ErrorBoundary
      key={request.id}
      fallback={<></>}
      onError={error => {
        logger.error(ledgerFlowRenderErrorMessage, error);
        toast.error('Something went wrong with the Ledger flow');
        closeWithError(isError(error) ? error.message : ledgerFlowRenderErrorMessage);
      }}
    >
      <LedgerDmkProvider>{renderLedgerFlow(request, close)}</LedgerDmkProvider>
    </Sentry.ErrorBoundary>
  );
}
