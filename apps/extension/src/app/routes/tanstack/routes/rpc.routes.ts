import { createRoute } from '@tanstack/react-router';

import { RouteUrls } from '@shared/route-urls';

import { BroadcastErrorSheet } from '@app/components/broadcast-error-dialog/broadcast-error-dialog';
import { FeeEditor } from '@app/features/fee-editor/fee-editor';
import { NonceEditor } from '@app/features/nonce-editor/nonce-editor';
import { RpcGetAddresses } from '@app/pages/rpc-get-addresses/rpc-get-addresses';
import { RpcSendTransfer } from '@app/pages/rpc-send-transfer/rpc-send-transfer';
import { RpcSendTransferContainer } from '@app/pages/rpc-send-transfer/rpc-send-transfer-container';
import { RpcSignPsbt } from '@app/pages/rpc-sign-psbt/rpc-sign-psbt';
import { RpcSignPsbtSummary } from '@app/pages/rpc-sign-psbt/rpc-sign-psbt-summary';
import { RpcStacksMessageSigning } from '@app/pages/rpc-sign-stacks-message/rpc-sign-stacks-message';
import { RpcStxCallContract } from '@app/pages/rpc-stx-call-contract/rpc-stx-call-contract';
import { RpcStxDeployContract } from '@app/pages/rpc-stx-deploy-contract/rpc-stx-deploy-contract';
import { RpcStxSignTransaction } from '@app/pages/rpc-stx-sign-transaction/rpc-stx-sign-transaction';
import { RpcStxTransferSip9Nft } from '@app/pages/rpc-stx-transfer-sip9-nft/rpc-stx-transfer-sip9-nft';
import { RpcStxTransferSip10Ft } from '@app/pages/rpc-stx-transfer-sip10-ft/rpc-stx-transfer-sip10-ft';
import { RpcStxTransferStx } from '@app/pages/rpc-stx-transfer-stx/rpc-stx-transfer-stx';

import { rootRoute } from '../root-route';
import {
  createLedgerBitcoinTxSigningRoutes,
  createLedgerStacksMessageSigningRoutes,
  createLedgerStacksTxSigningRoutes,
} from './ledger.routes';

const rpcGetAddressesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.RpcGetAddresses,
  component: RpcGetAddresses,
});

const rpcSendTransferRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.RpcSendTransfer,
  component: RpcSendTransferContainer,
});

const rpcSendTransferIndexRoute = createRoute({
  getParentRoute: () => rpcSendTransferRoute,
  path: '/',
  component: RpcSendTransfer,
});

const rpcSendTransferFeeEditorRoute = createRoute({
  getParentRoute: () => rpcSendTransferRoute,
  path: RouteUrls.FeeEditor,
  component: FeeEditor,
});

const rpcSignBip322MessageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.RpcSignBip322Message,
  component: () => null,
});

const rpcSignPsbtRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.RpcSignPsbt,
  component: RpcSignPsbt,
});

const rpcSignPsbtSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.RpcSignPsbtSummary,
  component: RpcSignPsbtSummary,
});

const rpcStacksSignatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: RouteUrls.RpcStacksSignature,
  component: RpcStacksMessageSigning,
});

function createStacksRpcRoutes(path: string, mainComponent: () => React.JSX.Element) {
  const parentRoute = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: () => null,
  });

  const indexRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/',
    component: mainComponent,
  });

  const feeEditorRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: RouteUrls.FeeEditor,
    component: FeeEditor,
  });

  const nonceEditorRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: RouteUrls.NonceEditor,
    component: NonceEditor,
  });

  const broadcastErrorRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: RouteUrls.BroadcastError,
    component: BroadcastErrorSheet,
  });

  return parentRoute.addChildren([
    indexRoute,
    feeEditorRoute,
    nonceEditorRoute,
    broadcastErrorRoute,
    createLedgerStacksTxSigningRoutes(parentRoute),
  ]);
}

const rpcStxCallContractRoutes = createStacksRpcRoutes(
  RouteUrls.RpcStxCallContract,
  RpcStxCallContract
);

const rpcStxDeployContractRoutes = createStacksRpcRoutes(
  RouteUrls.RpcStxDeployContract,
  RpcStxDeployContract
);

const rpcStxSignTransactionRoutes = createStacksRpcRoutes(
  RouteUrls.RpcStxSignTransaction,
  RpcStxSignTransaction
);

const rpcStxTransferStxRoutes = createStacksRpcRoutes(
  RouteUrls.RpcStxTransferStx,
  RpcStxTransferStx
);

const rpcStxTransferSip9NftRoutes = createStacksRpcRoutes(
  RouteUrls.RpcStxTransferSip9Nft,
  RpcStxTransferSip9Nft
);

const rpcStxTransferSip10FtRoutes = createStacksRpcRoutes(
  RouteUrls.RpcStxTransferSip10Ft,
  RpcStxTransferSip10Ft
);

export const rpcRoutes = [
  rpcGetAddressesRoute,
  rpcSendTransferRoute.addChildren([
    rpcSendTransferIndexRoute,
    rpcSendTransferFeeEditorRoute,
    createLedgerBitcoinTxSigningRoutes(rpcSendTransferRoute),
  ]),
  rpcSignBip322MessageRoute.addChildren([
    createLedgerBitcoinTxSigningRoutes(rpcSignBip322MessageRoute),
  ]),
  rpcSignPsbtRoute.addChildren([createLedgerBitcoinTxSigningRoutes(rpcSignPsbtRoute)]),
  rpcSignPsbtSummaryRoute,
  rpcStacksSignatureRoute.addChildren([
    createLedgerStacksMessageSigningRoutes(rpcStacksSignatureRoute),
  ]),
  rpcStxCallContractRoutes,
  rpcStxDeployContractRoutes,
  rpcStxSignTransactionRoutes,
  rpcStxTransferStxRoutes,
  rpcStxTransferSip9NftRoutes,
  rpcStxTransferSip10FtRoutes,
];
