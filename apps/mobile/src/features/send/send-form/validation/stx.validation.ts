import { validateStacksAddress } from '@stacks/transactions';
import { z } from 'zod';

import { ChainID, NetworkConfiguration } from '@leather.io/models';
import { isEmptyString, isUndefined } from '@leather.io/utils';

import { FormErrorMessages } from './common.validation';

export function validateAddressChain(address: string, currentNetwork: NetworkConfiguration) {
  const prefix = address.slice(0, 2);
  switch (currentNetwork.chain.stacks.chainId) {
    case ChainID.Mainnet:
      return prefix === 'SM' || prefix === 'SP';
    case ChainID.Testnet:
      return prefix === 'SN' || prefix === 'ST';
    default:
      return false;
  }
}

function notCurrentAddressValidatorFactory(currentAddress: string) {
  return (value?: string) => value !== currentAddress;
}

export function notCurrentAddressValidator(currentAddress: string) {
  return z.string().refine(notCurrentAddressValidatorFactory(currentAddress), {
    message: FormErrorMessages.SameAddress,
  });
}

function stxAddressNetworkValidatorFactory(currentNetwork: NetworkConfiguration) {
  return (value?: string) => {
    if (isUndefined(value) || isEmptyString(value)) return true;
    return validateAddressChain(value, currentNetwork);
  };
}

export function stxAddressNetworkValidator(currentNetwork: NetworkConfiguration) {
  return z.string().refine(stxAddressNetworkValidatorFactory(currentNetwork), {
    message: FormErrorMessages.IncorrectNetworkAddress,
  });
}

export function stxAddressValidator(errorMsg: string) {
  return z.string().refine(
    value => {
      if (isUndefined(value) || isEmptyString(value)) return true;
      return validateStacksAddress(value);
    },
    {
      message: errorMsg,
    }
  );
}
