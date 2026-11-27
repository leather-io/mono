import { HttpResponse, type RequestHandler, http } from 'msw';

import {
  leoToken,
  leoTokenPrincipal,
  rpcStacksContractInterfaces,
} from '../fixtures/rpc-stacks-contracts';
import { sip10Tokens } from '../fixtures/sip10';
import { hiroUrl, leatherApiUrl, readPathSegment } from '../handlers/urls';

const contractInterfaceHandler = http.get(
  hiroUrl('/v2/contracts/interface/:segment/:segment'),
  ({ request }) => {
    const contractId = `${readPathSegment(request.url, -2)}/${readPathSegment(request.url, -1)}`;
    const contractInterface = rpcStacksContractInterfaces[contractId];
    if (!contractInterface) return HttpResponse.json({}, { status: 404 });
    return HttpResponse.json(contractInterface);
  }
);

const leoTokenHandlers = [
  http.get(leatherApiUrl(`/v1/tokens/sip10s/${leoTokenPrincipal}`), () =>
    HttpResponse.json(leoToken)
  ),
  http.get(leatherApiUrl('/v1/tokens/sip10s'), () =>
    HttpResponse.json({
      format: 'map',
      data: { ...sip10Tokens, [leoTokenPrincipal]: leoToken },
    })
  ),
];

const broadcastTransactionLookupHandler = http.get(
  hiroUrl('/extended/v3/transactions/:segment'),
  () => HttpResponse.json({ error: 'Transaction not found' }, { status: 404 })
);

export const rpcStacksScenarios: Record<string, RequestHandler[]> = {
  'rpc-stacks': [contractInterfaceHandler, ...leoTokenHandlers, broadcastTransactionLookupHandler],
};
