import { Network, validate } from 'bitcoin-address-validation';

import { BitcoinNetworkModes, isValidBitcoinAddress } from '@leather.io/models';

// todo investigate handling this in bitcoinNetworkToNetworkMode
export function getBitcoinAddressNetworkType(network: BitcoinNetworkModes): Network {
  // Signet uses testnet address format, this parsing is to please the
  // validation library - 'bitcoin-address-validation'
  if (network === 'signet') return Network.testnet;
  return network as Network;
}

export function isValidBitcoinNetworkAddress(address: string, network: BitcoinNetworkModes) {
  if (!isValidBitcoinAddress(address) || !network) {
    return false;
  }

  return validate(address, getBitcoinAddressNetworkType(network));
}
