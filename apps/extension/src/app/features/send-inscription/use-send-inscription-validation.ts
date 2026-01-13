import * as yup from 'yup';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

import { FormErrorMessages } from '@shared/error-messages';
import { btcAddressNetworkValidator, btcAddressValidator } from '@shared/forms/address-validators';

import { complianceValidator } from '@app/common/validation/forms/compliance-validators';

const recipientFieldName = 'recipient';

export function useSendInscriptionValidation(networkMode: BitcoinNetworkModes) {
  return yup.object({
    [recipientFieldName]: yup
      .string()
      .required(FormErrorMessages.AddressRequired)
      .concat(btcAddressValidator())
      .concat(
        complianceValidator(btcAddressValidator(), bitcoinNetworkModeToCoreNetworkMode(networkMode))
      )
      .concat(btcAddressNetworkValidator(networkMode)),
  });
}
