import { useLeatherNetwork } from '@/queries/leather-query-provider';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { BNS_V2_API_BASE_URL } from '@leather.io/models';
import { bnsV2Client } from '@leather.io/query';
import { whenNetwork } from '@leather.io/utils';

export function useBnsV2Client() {
  const network = useLeatherNetwork();
  const basePath = whenNetwork(bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode))({
    mainnet: BNS_V2_API_BASE_URL,
    // TODO: Add testnet support if there will be a testnet BNSv2 API
    testnet: BNS_V2_API_BASE_URL,
  });
  return bnsV2Client(basePath);
}
