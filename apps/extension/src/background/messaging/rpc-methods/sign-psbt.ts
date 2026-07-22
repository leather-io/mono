import * as btc from '@scure/btc-signer';
import { hexToBytes } from '@stacks/common';

import { isWshDescriptor } from '@leather.io/bitcoin';
import { RpcErrorCode, createRpcErrorResponse, signPsbt } from '@leather.io/rpc';
import { ensureArray, isDefined, isUndefined } from '@leather.io/utils';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { RouteUrls } from '@shared/route-urls';
import {
  formatValidationErrors,
  getRpcParamErrors,
  validateRpcParams,
} from '@shared/rpc/methods/validation.utils';

import { trackRpcRequestError, trackRpcRequestSuccess } from '../rpc-helpers';
import { defineRpcRequestHandler } from '../rpc-message-handler';
import {
  RequestParams,
  createConnectingAppSearchParamsWithLastKnownAccount,
  getOriginatingFrameFromPort,
  sendErrorResponseOnUserPopupClose,
  triggerRequestPopupWindowOpen,
  validateRequestNetwork,
} from '../rpc-request-utils';

function validatePsbt(hex: string) {
  try {
    btc.Transaction.fromPSBT(hexToBytes(hex));
    return true;
  } catch {
    return false;
  }
}

function validateRpcSignPsbtParams(obj: unknown) {
  return validateRpcParams(obj, signPsbt.params);
}

function getRpcSignPsbtParamErrors(obj: unknown) {
  return formatValidationErrors(getRpcParamErrors(obj, signPsbt.params));
}
export const signPsbtHandler = defineRpcRequestHandler(signPsbt.method, async (request, port) => {
  if (isUndefined(request.params)) {
    void trackRpcRequestError({ endpoint: request.method, error: 'Undefined parameters' });
    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createRpcErrorResponse(request.method, {
        id: request.id,
        error: { code: RpcErrorCode.INVALID_REQUEST, message: 'Parameters undefined' },
      })
    );
    return;
  }

  if (!validateRpcSignPsbtParams(request.params)) {
    void trackRpcRequestError({ endpoint: request.method, error: 'Invalid parameters' });
    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createRpcErrorResponse(request.method, {
        id: request.id,
        error: {
          code: RpcErrorCode.INVALID_PARAMS,
          message: getRpcSignPsbtParamErrors(request.params),
        },
      })
    );
    return;
  }

  const networkValidation = await validateRequestNetwork({
    id: request.id,
    method: request.method,
    network: request.params.network,
    port,
  });
  if (networkValidation.status === 'failure') return;

  if (!validatePsbt(request.params.hex)) {
    void trackRpcRequestError({ endpoint: request.method, error: 'Invalid PSBT' });

    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createRpcErrorResponse('signPsbt', {
        id: request.id,
        error: { code: RpcErrorCode.INVALID_PARAMS, message: 'Invalid PSBT hex' },
      })
    );
    return;
  }

  if (isDefined(request.params.descriptor) && !isWshDescriptor(request.params.descriptor)) {
    void trackRpcRequestError({ endpoint: request.method, error: 'Invalid descriptor' });

    void sendMessageToOriginatingFrame(
      getOriginatingFrameFromPort(port),
      createRpcErrorResponse('signPsbt', {
        id: request.id,
        error: {
          code: RpcErrorCode.INVALID_PARAMS,
          message: 'Only wsh() descriptors are supported',
        },
      })
    );
    return;
  }

  const requestParams: RequestParams = [
    ['hex', request.params.hex],
    ['requestId', request.id],
  ];

  if (isDefined(request.params.account)) {
    requestParams.push(['accountIndex', request.params.account.toString()]);
  }

  if (isDefined(request.params.broadcast)) {
    requestParams.push(['broadcast', request.params.broadcast.toString()]);
  }

  if (isDefined(request.params.descriptor)) {
    requestParams.push(['descriptor', request.params.descriptor]);
  }

  if (isDefined(request.params.signAtIndex))
    ensureArray(request.params.signAtIndex).forEach(index =>
      requestParams.push(['signAtIndex', index.toString()])
    );

  void trackRpcRequestSuccess({ endpoint: request.method });

  const { frameId, urlParams, tabId } = await createConnectingAppSearchParamsWithLastKnownAccount(
    port,
    requestParams,
    { network: request.params.network }
  );

  const { id } = await triggerRequestPopupWindowOpen(RouteUrls.RpcSignPsbt, urlParams);

  sendErrorResponseOnUserPopupClose({
    frameId,
    tabId,
    id,
    request,
    message: 'User rejected signing PSBT request',
  });
});
