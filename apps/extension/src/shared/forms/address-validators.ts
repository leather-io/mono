import { z } from 'zod';

import {
  btcAddressNetworkPredicate,
  btcAddressPredicate,
  nonEmptyStringPredicate,
} from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

import { FormErrorMessages } from '@shared/error-messages';

export function nonEmptyStringValidator(message = '') {
  return z.refine<string | undefined>(nonEmptyStringPredicate, {
    error: message,
  });
}

export function btcAddressValidator() {
  return z.refine<string | undefined>(btcAddressPredicate, {
    error: FormErrorMessages.InvalidAddress,
  });
}

export function btcAddressNetworkValidator(network: BitcoinNetworkModes) {
  return z.refine<string | undefined>(btcAddressNetworkPredicate(network), {
    error: FormErrorMessages.IncorrectNetworkAddress,
  });
}
