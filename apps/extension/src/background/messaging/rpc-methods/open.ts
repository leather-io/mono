import {
  RpcErrorCode,
  createRpcErrorResponse,
  createRpcSuccessResponse,
  open,
} from '@leather.io/rpc';

import { isConnectedToExistingWallet } from '@shared/permissions/permission.helpers';
import { RouteUrls } from '@shared/route-urls';
import { getRootState, sendMissingStateErrorToTab } from '@shared/storage/get-root-state';

import { openNewTabWithWallet, trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  createConnectingAppSearchParamsWithLastKnownAccount,
  getHostnameFromPort,
  triggerRequestPopupWindowOpen,
} from '../rpc-request-utils';

export const openHandler = defineRpcRequestHandler(open.method, async (request, port) => {
  const { urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(port, [
    ['requestId', request.id],
  ]);

  const state = await getRootState();
  const hostname = getHostnameFromPort(port);

  if (!state) {
    void sendMissingStateErrorToTab({ tabId, method: request.method, id: request.id });
    return;
  }

  const originPermissions = state.appPermissions.entities[hostname];

  if (!isConnectedToExistingWallet(originPermissions, state.wallets.entities)) {
    void chrome.tabs.sendMessage(
      tabId,
      createRpcErrorResponse('open', {
        id: request.id,
        error: {
          code: RpcErrorCode.UNAUTHENTICATED,
          message: 'Permission denied, user must first connect to the wallet',
        },
      })
    );
    return;
  }

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

  void chrome.tabs.sendMessage(
    tabId,
    createRpcSuccessResponse('open', {
      id: request.id,
      result: { success: true },
    })
  );
});
