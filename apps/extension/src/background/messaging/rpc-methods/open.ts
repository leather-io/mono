import { createRpcSuccessResponse, open } from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';

import { openNewTabWithWallet, trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  createConnectingAppSearchParamsWithLastKnownAccount,
  triggerRequestPopupWindowOpen,
  validateConnectedWalletExists,
} from '../rpc-request-utils';

export const openHandler = defineRpcRequestHandler(open.method, async (request, port) => {
  const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
    port,
    [['requestId', request.id]]
  );

  const { status } = await validateConnectedWalletExists(
    request,
    port,
    'Permission denied, user must first connect to the wallet'
  );
  if (status === 'failure') return;

  switch (request.params.mode) {
    case 'fullpage':
      void openNewTabWithWallet();
      break;
    case 'popup':
    default:
      void triggerRequestPopupWindowOpen(RouteUrls.Home, urlParams);
      break;
  }

  void trackRpcRequestSuccess({ endpoint: request.method });

  void sendMessageToOriginatingFrame(
    { frameId, tabId },
    createRpcSuccessResponse('open', {
      id: request.id,
      result: { success: true },
    })
  );
});
