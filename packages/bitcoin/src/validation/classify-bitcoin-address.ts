import * as btc from '@scure/btc-signer';

import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';

type BitcoinAddressNetwork = 'mainnet' | 'testnet' | 'regtest';
type BitcoinAddressType = 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh' | 'p2tr';

export interface BitcoinAddressClass {
  network: BitcoinAddressNetwork;
  type: BitcoinAddressType;
}

const networks: BitcoinAddressNetwork[] = ['mainnet', 'testnet', 'regtest'];

const addressTypes: Record<string, BitcoinAddressType | undefined> = {
  pkh: 'p2pkh',
  sh: 'p2sh',
  wpkh: 'p2wpkh',
  wsh: 'p2wsh',
  tr: 'p2tr',
};

function classifyOnNetwork(
  address: string,
  network: BitcoinAddressNetwork
): BitcoinAddressClass | undefined {
  try {
    const coder = btc.Address(getBtcSignerLibNetworkConfigByMode(network));
    const decoded = coder.decode(address);
    const type = addressTypes[decoded.type];
    if (type === undefined || coder.encode(decoded) !== address) return undefined;
    return { network, type };
  } catch {
    return undefined;
  }
}

export function classifyBitcoinAddress(address: string): BitcoinAddressClass {
  if (typeof address !== 'string') throw new TypeError('Address must be a string.');
  for (const network of networks) {
    const found = classifyOnNetwork(address, network);
    if (found) return found;
  }
  throw new RangeError('Not a Bitcoin address in its canonical form.');
}
