import { pox5NetworkConfig } from '~/data/pox5-network-config';

import { accountsBalanceStxHandler } from './accounts-address-balance-stx';
import { hiroInfoHandler } from './info';
import { poxMainnetHandler } from './pox';
import { principalsMempoolTransactionsHandler } from './principals-mempool-transactions';

// The pox-5 read layer is pinned to the chain selected in
// data/pox5-network-config.ts, so mock mode needs the node/account endpoints
// answered at that host too. Responses are shared with the app-network mocks —
// only the host differs.
interface EndpointHandler {
  path: string;
  resp: Record<string, unknown>;
  method: 'get' | 'post';
}

function atPox5Host(handler: EndpointHandler): EndpointHandler {
  return {
    ...handler,
    path: handler.path.replace(/^https:\/\/api(\.mainnet)?\.hiro\.so/, pox5NetworkConfig.apiUrl),
  };
}

export const pox5PinnedNetworkHandlers = [
  poxMainnetHandler,
  hiroInfoHandler,
  accountsBalanceStxHandler,
  principalsMempoolTransactionsHandler,
].map(atPox5Host);
