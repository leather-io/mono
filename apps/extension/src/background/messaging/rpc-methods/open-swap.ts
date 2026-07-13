import { createRpcSuccessResponse, openSwap } from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import { replaceRouteParams } from '@shared/utils/replace-route-params';

import { trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  createConnectingAppSearchParamsWithLastKnownAccount,
  triggerSwapWindowOpen,
} from '../rpc-request-utils';

export const openSwapHandler = defineRpcRequestHandler(openSwap.method, async (request, port) => {
  const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
    port,
    [['requestId', request.id]]
  );
  const { base = 'STX', quote } = request?.params || {};

  if (base === 'BTC') {
    await triggerSwapWindowOpen(
      replaceRouteParams(RouteUrls.Swap, {
        base: base,
        quote: quote ?? '',
      }).replace('{chain}', 'bitcoin'),
      urlParams
    );
  } else {
    await triggerSwapWindowOpen(
      replaceRouteParams(RouteUrls.Swap, {
        base: base,
        quote: quote ?? '',
      }).replace('{chain}', 'stacks'),
      urlParams
    );
  }

  void trackRpcRequestSuccess({ endpoint: request.method });

  void sendMessageToOriginatingFrame(
    { frameId, tabId },
    createRpcSuccessResponse('openSwap', {
      id: request.id,
      result: { message: 'Success' },
    })
  );
});
