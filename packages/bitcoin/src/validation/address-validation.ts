import { Network, validate } from 'bitcoin-address-validation';

import { BitcoinAddress, BitcoinNetworkModes, isBitcoinAddress } from '@leather.io/models';
import { isEmptyString, isUndefined } from '@leather.io/utils';

// todo investigate handling this in bitcoinNetworkToNetworkMode
export function getBitcoinAddressNetworkType(network: BitcoinNetworkModes): Network {
  // Signet uses testnet address format, this parsing is to please the
  // validation library - 'bitcoin-address-validation'
  if (network === 'signet') return Network.testnet;
  return network as Network;
}

export function isValidBitcoinAddress(address: BitcoinAddress) {
  if (isUndefined(address) || isEmptyString(address)) {
    return false;
  }
  if (!isBitcoinAddress(address)) {
    return false;
  }

  try {
    validate(address);
    return true;
  } catch {
    return false;
  }
}

export function isValidBitcoinNetworkAddress(
  address: BitcoinAddress,
  network: BitcoinNetworkModes
) {
  if (!isValidBitcoinAddress(address) || !network) {
    return false;
  }

  try {
    validate(address, getBitcoinAddressNetworkType(network));
    return true;
  } catch {
    return false;
  }
}
