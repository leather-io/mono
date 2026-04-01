import { ChainId, StacksNetwork } from '@stacks/network';
import { poxAddressToBtcAddress } from '@stacks/stacking';

import { whenStacksChainId } from '@leather.io/stacks';

interface ConvertToPoxAddressBtc {
  version: Uint8Array;
  hashbytes: Uint8Array;
}
function convertPoxAddressToBtc(network: 'mainnet' | 'testnet') {
  return ({ version, hashbytes }: ConvertToPoxAddressBtc) => {
    return poxAddressToBtcAddress(version[0], hashbytes, network);
  };
}

export function formatPoxAddressToNetwork(
  network: StacksNetwork,
  poxAddress: ConvertToPoxAddressBtc
) {
  return convertPoxAddressToBtc(
    whenStacksChainId(network.chainId)({
      [ChainId.Mainnet]: 'mainnet',
      [ChainId.Testnet]: 'testnet',
    })
  )(poxAddress);
}
