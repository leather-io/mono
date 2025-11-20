import { createRequestEncoder, stxPersonalSign } from '@leather.io/rpc';

import { initialSearchParams } from '@app/common/initial-search-params';

export function getDecodedRpcStxPersonalSignRequest() {
  const { decode } = createRequestEncoder(stxPersonalSign.request);
  const rpcRequest = initialSearchParams.get('rpcRequest');
  if (!rpcRequest) throw new Error('Missing rpcRequest');
  return decode(rpcRequest);
}
