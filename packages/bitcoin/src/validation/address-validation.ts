import { Network, getAddressInfo, validate } from 'bitcoin-address-validation';

import { BitcoinNetworkModes } from '@leather.io/models';
import { isEmptyString, isUndefined } from '@leather.io/utils';

// todo investigate handling this in bitcoinNetworkToNetworkMode
export function getBitcoinAddressNetworkType(network: BitcoinNetworkModes): Network {
  // Signet uses testnet address format, this parsing is to please the
  // validation library - 'bitcoin-address-validation'
  if (network === 'signet') return Network.testnet;
  return network as Network;
}

export function isValidBitcoinAddress(address: string) {
  if (isUndefined(address) || isEmptyString(address)) {
    return false;
  }

  return validate(address);
}

export function isValidBitcoinNetworkAddress(address: string, network: BitcoinNetworkModes) {
  return validate(address, getBitcoinAddressNetworkType(network));
}

export const bitcoinAddressTypes = ['p2pkh', 'p2sh', 'p2wpkh', 'p2wsh', 'p2tr'] as const;

export type BitcoinAddressType = (typeof bitcoinAddressTypes)[number];

export function getBitcoinAddressType(address: string): BitcoinAddressType | undefined {
  if (isUndefined(address) || isEmptyString(address)) return undefined;
  try {
    const addressType: string = getAddressInfo(address).type;
    return bitcoinAddressTypes.find(type => type === addressType);
  } catch {
    return undefined;
  }
}
