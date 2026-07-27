import { accountsBalanceStxHandler } from './accounts-address-balance-stx';
import { transactionWithTransfersHandler } from './address-address-transactions-with-transfers';
import { hiroInfoHandler } from './info';
import { mempoolHandler } from './mempool';
import { poxMainnetHandler } from './pox';

// The pox-5 read layer is pinned to the private testnet API, so mock mode
// needs the node/account endpoints answered at that host too. Responses are
// shared with the app-network mocks — only the host differs.
const pox5PrivateApiUrl = 'https://api.testnet-pox5.hiro.so';

interface EndpointHandler {
  path: string;
  resp: Record<string, unknown>;
  method: 'get' | 'post';
}

function atPox5PrivateHost(handler: EndpointHandler): EndpointHandler {
  return {
    ...handler,
    path: handler.path.replace(/^https:\/\/api(\.mainnet)?\.hiro\.so/, pox5PrivateApiUrl),
  };
}

export const pox5PrivateNetworkHandlers = [
  poxMainnetHandler,
  hiroInfoHandler,
  accountsBalanceStxHandler,
  transactionWithTransfersHandler,
  mempoolHandler,
].map(atPox5PrivateHost);
