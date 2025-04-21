import { RpcRequest, stxSignTransaction } from '@leather.io/rpc';

export function getTxHexFromRequest(request: RpcRequest<typeof stxSignTransaction>) {
  if ('txHex' in request.params) {
    return request.params.txHex;
  }
  return request.params.transaction;
}
