import { createRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { BroadcastErrorSheet } from '@app/components/broadcast-error-dialog/broadcast-error-dialog';
import { EditNonceSheet } from '@app/features/dialogs/edit-nonce-dialog/edit-nonce-dialog';
import { StacksHighFeeWarningContainer } from '@app/features/stacks-high-fee-warning/stacks-high-fee-warning-container';
import { PsbtRequest } from '@app/pages/psbt-request/psbt-request';
import { SignStacksMessageRequest } from '@app/pages/sign-stacks-message-request/sign-stacks-message-request';
import { TransactionRequest } from '@app/pages/transaction-request/transaction-request';

import { rootRoute } from '../root-route';
import {
  createLedgerStacksMessageSigningRoutes,
  createLedgerStacksTxSigningRoutes,
} from './ledger.routes';

const transactionRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.TransactionRequest,
  component: function TransactionRequestWithHighFeeWarning() {
    return (
      <StacksHighFeeWarningContainer>
        <TransactionRequest />
      </StacksHighFeeWarningContainer>
    );
  },
});

const transactionRequestNonceRoute = createRoute({
  getParentRoute: () => transactionRequestRoute,
  path: RouteUrls.EditNonce,
  component: EditNonceSheet,
});

const transactionRequestBroadcastErrorRoute = createRoute({
  getParentRoute: () => transactionRequestRoute,
  path: RouteUrls.BroadcastError,
  component: BroadcastErrorSheet,
});

const signatureRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.SignatureRequest,
  component: SignStacksMessageRequest,
});

const psbtRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.PsbtRequest,
  component: PsbtRequest,
});

export const requestRoutes = [
  transactionRequestRoute.addChildren([
    createLedgerStacksTxSigningRoutes(transactionRequestRoute),
    transactionRequestNonceRoute,
    transactionRequestBroadcastErrorRoute,
  ]),
  signatureRequestRoute.addChildren([
    createLedgerStacksMessageSigningRoutes(signatureRequestRoute),
  ]),
  psbtRequestRoute,
];
