import { Network, getAddressInfo, validate } from 'bitcoin-address-validation';
import { z } from 'zod';

import type { BitcoinNetworkModes } from '@leather.io/models';
import { isEmptyString, isUndefined } from '@leather.io/utils';

import { FormErrorMessages } from '@shared/error-messages';

export function nonEmptyStringValidator(message = '') {
  return z.refine<string | undefined>(value => value !== undefined && value.trim() !== '', {
    error: message,
  });
}

export function btcAddressValidator() {
  return z.refine<string | undefined>(
    value => {
      if (isUndefined(value) || isEmptyString(value)) return true;
      return validate(value);
    },
    { error: FormErrorMessages.InvalidAddress }
  );
}

const networkToBitcoinNetworkMode: Record<Network, BitcoinNetworkModes> = {
  [Network.mainnet]: 'mainnet',
  [Network.testnet]: 'testnet',
  [Network.regtest]: 'regtest',
};

const bitcoinNetworkModeToNetwork: Record<Exclude<BitcoinNetworkModes, 'signet'>, Network> = {
  mainnet: Network.mainnet,
  testnet: Network.testnet,
  regtest: Network.regtest,
};

export function getNetworkTypeFromAddress(address: string) {
  return networkToBitcoinNetworkMode[getAddressInfo(address).network];
}

function btcAddressNetworkValidatorFactory(network: BitcoinNetworkModes) {
  function getAddressNetworkType(network: BitcoinNetworkModes): Network {
    // Signet uses testnet address format, this parsing is to please the
    // validation library
    if (network === 'signet') return Network.testnet;
    return bitcoinNetworkModeToNetwork[network];
  }
  return (value?: string) => {
    if (isUndefined(value) || isEmptyString(value)) return true;
    return validate(value, getAddressNetworkType(network));
  };
}

export function btcAddressNetworkValidator(network: BitcoinNetworkModes) {
  return z.refine<string | undefined>(btcAddressNetworkValidatorFactory(network), {
    error: FormErrorMessages.IncorrectNetworkAddress,
  });
}
