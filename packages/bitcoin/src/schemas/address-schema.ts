import { Network, getAddressInfo, validate } from 'bitcoin-address-validation';
import { z } from 'zod';

import type { BitcoinNetworkModes } from '@leather.io/models';
import { isDefined, isEmptyString, isUndefined } from '@leather.io/utils';

import { getBitcoinAddressNetworkType } from '../validation/address-validation';

const networkModeByAddressNetwork: Record<Network, BitcoinNetworkModes> = {
  [Network.mainnet]: 'mainnet',
  [Network.testnet]: 'testnet',
  [Network.regtest]: 'regtest',
};

export function nonEmptyStringValidator(message = '') {
  return z
    .string()
    .refine((value: string) => value !== undefined && value.trim() !== '', { message });
}

export function btcAddressValidator() {
  return z.string().refine(
    (value: string) => {
      if (isUndefined(value) || isEmptyString(value)) return true;
      return validate(value);
    },
    { message: 'Bitcoin address is not valid' }
  );
}

export function getNetworkTypeFromAddress(address: string) {
  return networkModeByAddressNetwork[getAddressInfo(address).network];
}

function btcAddressNetworkValidatorFactory(network: BitcoinNetworkModes) {
  function getAddressNetworkType(network: BitcoinNetworkModes): Network | undefined {
    // Signet uses testnet address format, this parsing is to please the
    // validation library
    if (network === 'signet') return Network.testnet;
    return getBitcoinAddressNetworkType(network);
  }
  return (value?: string) => {
    if (isUndefined(value) || isEmptyString(value)) return true;
    const addressNetwork = getAddressNetworkType(network);
    return isDefined(addressNetwork) && validate(value, addressNetwork);
  };
}

export function btcAddressNetworkValidator(network: BitcoinNetworkModes) {
  return z.string().refine(btcAddressNetworkValidatorFactory(network), {
    message: 'Address is for incorrect network',
  });
}
