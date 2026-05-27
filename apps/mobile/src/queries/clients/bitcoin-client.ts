import { useMemo } from 'react';

import { bitcoinClient } from '@leather.io/query';

import { useLeatherNetwork } from '../leather-query-provider';

export function useBitcoinClient() {
  const network = useLeatherNetwork();

  return useMemo(
    () =>
      bitcoinClient({
        networkName: network.chain.bitcoin.bitcoinNetwork,
        basePath: network.chain.bitcoin.bitcoinUrl,
      }),
    [network.chain.bitcoin.bitcoinNetwork, network.chain.bitcoin.bitcoinUrl]
  );
}
