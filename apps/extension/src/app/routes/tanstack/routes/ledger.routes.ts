import { createRoute } from '@tanstack/react-router';
import type { AnyRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { ApproveSignLedgerBitcoinTx } from '@app/features/ledger/flows/bitcoin-tx-signing/steps/approve-bitcoin-sign-ledger-tx';
import { LedgerSignJwtContainer } from '@app/features/ledger/flows/jwt-signing/ledger-sign-jwt-container';
import { ConnectLedgerSignJwt } from '@app/features/ledger/flows/jwt-signing/steps/connect-ledger-sign-jwt';
import { SignJwtHash } from '@app/features/ledger/flows/jwt-signing/steps/sign-jwt-hash';
import { LedgerRequestBitcoinKeys } from '@app/features/ledger/flows/request-bitcoin-keys/ledger-request-bitcoin-keys';
import { LedgerRequestStacksKeys } from '@app/features/ledger/flows/request-stacks-keys/ledger-request-stacks-keys';
import { LedgerSignMsgContainer } from '@app/features/ledger/flows/stacks-message-signing/ledger-stacks-sign-msg-container';
import { ConnectLedgerSignMsg } from '@app/features/ledger/flows/stacks-message-signing/steps/connect-ledger-sign-msg';
import { SignLedgerMessage } from '@app/features/ledger/flows/stacks-message-signing/steps/sign-stacks-ledger-message';
import { ApproveSignLedgerStacksTx } from '@app/features/ledger/flows/stacks-tx-signing/steps/approve-sign-stacks-ledger-tx';
import { ContractPrincipalBugWarning } from '@app/features/ledger/flows/stacks-tx-signing/steps/contract-principal-bug-warning';
import { ConnectLedgerRequestKeys } from '@app/features/ledger/generic-flows/request-keys/steps/connect-ledger-request-keys';
import { ConnectLedgerSignTx } from '@app/features/ledger/generic-flows/tx-signing/steps/connect-ledger-sign-tx';
import {
  ConnectLedgerError,
  ConnectLedgerSuccess,
  DeviceBusy,
  LedgerDeviceInvalidPayload,
  LedgerDisconnected,
  LedgerPublicKeyMismatch,
  OperationRejected,
  UnsupportedBrowserLayout,
} from '@app/features/ledger/generic-steps';
import { LedgerBroadcastError } from '@app/features/ledger/generic-steps/broadcast-error/broadcast-error';

let ledgerRouteCounter = 0;

function nextId(prefix: string) {
  ledgerRouteCounter += 1;
  return `${prefix}-${ledgerRouteCounter}`;
}

function createTxSigningStepRoutes(containerRoute: AnyRoute) {
  return [
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedger,
      component: ConnectLedgerSignTx,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.DeviceBusy,
      component: DeviceBusy,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerError,
      component: ConnectLedgerError,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerUnsupportedBrowser,
      component: UnsupportedBrowserLayout,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerSuccess,
      component: ConnectLedgerSuccess,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerDisconnected,
      component: LedgerDisconnected,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerOperationRejected,
      component: OperationRejected,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerPublicKeyMismatch,
      component: LedgerPublicKeyMismatch,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerDevicePayloadInvalid,
      component: LedgerDeviceInvalidPayload,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerOutdatedAppWarning,
      component: ContractPrincipalBugWarning,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerBroadcastError,
      component: LedgerBroadcastError,
    }),
  ];
}

export function createLedgerBitcoinTxSigningRoutes(parentRoute: AnyRoute) {
  const prefix = nextId('lbtc');
  const containerRoute = createRoute({
    getParentRoute: () => parentRoute,
    id: prefix,
    component: () => null,
  });

  return containerRoute.addChildren([
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.AwaitingDeviceUserAction,
      component: ApproveSignLedgerBitcoinTx,
    }),
    ...createTxSigningStepRoutes(containerRoute),
  ]);
}

export function createLedgerStacksTxSigningRoutes(parentRoute: AnyRoute) {
  const prefix = nextId('lstx');
  const containerRoute = createRoute({
    getParentRoute: () => parentRoute,
    id: prefix,
    component: () => null,
  });

  return containerRoute.addChildren([
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.AwaitingDeviceUserAction,
      component: ApproveSignLedgerStacksTx,
    }),
    ...createTxSigningStepRoutes(containerRoute),
  ]);
}

export function createLedgerStacksMessageSigningRoutes(parentRoute: AnyRoute) {
  const prefix = nextId('lmsg');
  const containerRoute = createRoute({
    getParentRoute: () => parentRoute,
    id: prefix,
    component: LedgerSignMsgContainer,
  });

  return containerRoute.addChildren([
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedger,
      component: ConnectLedgerSignMsg,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.DeviceBusy,
      component: DeviceBusy,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerError,
      component: ConnectLedgerError,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerSuccess,
      component: ConnectLedgerSuccess,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.AwaitingDeviceUserAction,
      component: SignLedgerMessage,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerDisconnected,
      component: LedgerDisconnected,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerOperationRejected,
      component: OperationRejected,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerPublicKeyMismatch,
      component: LedgerPublicKeyMismatch,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerUnsupportedBrowser,
      component: UnsupportedBrowserLayout,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerDevicePayloadInvalid,
      component: LedgerDeviceInvalidPayload,
    }),
  ]);
}

export function createLedgerJwtSigningRoutes(parentRoute: AnyRoute) {
  const prefix = nextId('ljwt');
  const containerRoute = createRoute({
    getParentRoute: () => parentRoute,
    id: prefix,
    component: LedgerSignJwtContainer,
  });

  return containerRoute.addChildren([
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedger,
      component: ConnectLedgerSignJwt,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerError,
      component: ConnectLedgerError,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerSuccess,
      component: ConnectLedgerSuccess,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerOperationRejected,
      component: OperationRejected,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.DeviceBusy,
      component: DeviceBusy,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.AwaitingDeviceUserAction,
      component: SignJwtHash,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerDisconnected,
      component: LedgerDisconnected,
    }),
  ]);
}

export function createLedgerRequestBitcoinKeysRoutes(parentRoute: AnyRoute) {
  const containerRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: 'bitcoin',
    component: LedgerRequestBitcoinKeys,
  });

  return containerRoute.addChildren([
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedger,
      component: ConnectLedgerRequestKeys,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.DeviceBusy,
      component: DeviceBusy,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerError,
      component: ConnectLedgerError,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerSuccess,
      component: ConnectLedgerSuccess,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerUnsupportedBrowser,
      component: UnsupportedBrowserLayout,
    }),
  ]);
}

export function createLedgerRequestStacksKeysRoutes(parentRoute: AnyRoute) {
  const containerRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: 'stacks',
    component: LedgerRequestStacksKeys,
  });

  return containerRoute.addChildren([
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedger,
      component: ConnectLedgerRequestKeys,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.DeviceBusy,
      component: DeviceBusy,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerError,
      component: ConnectLedgerError,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.ConnectLedgerSuccess,
      component: ConnectLedgerSuccess,
    }),
    createRoute({
      getParentRoute: () => containerRoute,
      path: RouteUrls.LedgerUnsupportedBrowser,
      component: UnsupportedBrowserLayout,
    }),
  ]);
}
