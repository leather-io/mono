import { useMemo } from 'react';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import {
  BESTINSLOT_API_BASE_URL_MAINNET,
  BESTINSLOT_API_BASE_URL_TESTNET,
} from '@leather.io/models';
import { bitcoinClient } from '@leather.io/query';
import { whenNetwork } from '@leather.io/utils';

import { useFlags } from '@app/features/feature-flags';
import { useLeatherNetwork } from '@app/query/leather-query-provider';

export function useBitcoinClient() {
  const network = useLeatherNetwork();
  const { isOrdinalsActive, isRunesActive } = useFlags();
  const bestInSlotPath = whenNetwork(
    bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode)
  )({
    mainnet: BESTINSLOT_API_BASE_URL_MAINNET,
    testnet: BESTINSLOT_API_BASE_URL_TESTNET,
  });

  return useMemo(
    () =>
      bitcoinClient({
        networkName: network.chain.bitcoin.bitcoinNetwork,
        basePath: network.chain.bitcoin.bitcoinUrl,
        bestInSlotPath,
        bestInSlotOptions: { isOrdinalsActive, isRunesActive },
      }),
    [
      bestInSlotPath,
      network.chain.bitcoin.bitcoinNetwork,
      network.chain.bitcoin.bitcoinUrl,
      isOrdinalsActive,
      isRunesActive,
    ]
  );
}
