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

const swapAssetSymbolRegex = /^[a-zA-Z0-9$._-]{1,32}$/;

function toSwapAssetSymbol(value?: string) {
  return value && swapAssetSymbolRegex.test(value) ? value : undefined;
}

export const openSwapHandler = defineRpcRequestHandler(openSwap.method, async (request, port) => {
  const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
    port,
    [['requestId', request.id]]
  );
  const params = request?.params || {};
  const base = toSwapAssetSymbol(params.base) ?? 'STX';
  const quote = toSwapAssetSymbol(params.quote);

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
