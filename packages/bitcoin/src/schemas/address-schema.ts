import { Network, getAddressInfo, validate } from 'bitcoin-address-validation';
import { z } from 'zod';

import type { BitcoinNetworkModes } from '@leather.io/models';
import { isEmptyString, isUndefined } from '@leather.io/utils';

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
  return getAddressInfo(address).network as BitcoinNetworkModes;
}

function btcAddressNetworkValidatorFactory(network: BitcoinNetworkModes) {
  function getAddressNetworkType(network: BitcoinNetworkModes): Network {
    // Signet uses testnet address format, this parsing is to please the
    // validation library
    if (network === 'signet') return Network.testnet;
    return network as Network;
  }
  return (value?: string) => {
    if (isUndefined(value) || isEmptyString(value)) return true;
    return validate(value, getAddressNetworkType(network));
  };
}

export function btcAddressNetworkValidator(network: BitcoinNetworkModes) {
  return z.string().refine(btcAddressNetworkValidatorFactory(network), {
    message: 'Address is for incorrect network',
  });
}
