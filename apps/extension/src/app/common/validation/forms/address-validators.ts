import { z } from 'zod';

import type { NetworkConfiguration } from '@leather.io/models';
import { isEmptyString, isUndefined } from '@leather.io/utils';

import { FormErrorMessages } from '@shared/error-messages';

import { validateAddressChain, validateStacksAddress } from '@app/common/stacks-utils';

function notCurrentAddressValidatorFactory(currentAddress: string) {
  return (value?: string) => value !== currentAddress;
}

export function notCurrentAddressValidator(currentAddress: string) {
  return z.refine<string | undefined>(notCurrentAddressValidatorFactory(currentAddress), {
    error: FormErrorMessages.SameAddress,
  });
}

function stxAddressNetworkValidatorFactory(currentNetwork: NetworkConfiguration) {
  return (value?: string) => {
    if (isUndefined(value) || isEmptyString(value)) return true;
    return validateAddressChain(value, currentNetwork);
  };
}

export function stxAddressNetworkValidator(currentNetwork: NetworkConfiguration) {
  return z.refine<string | undefined>(stxAddressNetworkValidatorFactory(currentNetwork), {
    error: FormErrorMessages.IncorrectNetworkAddress,
  });
}

export function stxAddressValidator(errorMsg: string) {
  return z.refine<string | undefined>(
    value => {
      if (isUndefined(value) || isEmptyString(value)) return true;
      return validateStacksAddress(value);
    },
    { error: errorMsg }
  );
}
