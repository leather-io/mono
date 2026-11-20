import type { NetworkConfiguration } from '@leather.io/models';
import type { UserSettings } from '@leather.io/services';

import { FormErrorMessages } from '@shared/error-messages';
import { stringField } from '@shared/forms/field-schemas';

import {
  notCurrentAddressValidator,
  stxAddressNetworkValidator,
  stxAddressValidator,
} from './address-validators';
import { complianceValidator } from './compliance-validators';

export function stxRecipientValidator(
  currentAddress: string,
  currentNetwork: NetworkConfiguration,
  settings: UserSettings
) {
  return stringField().check(
    stxAddressValidator(FormErrorMessages.InvalidAddress),
    stxAddressNetworkValidator(currentNetwork),
    notCurrentAddressValidator(currentAddress),
    complianceValidator(
      stxAddressValidator(FormErrorMessages.InvalidAddress),
      'send_form_stx',
      settings
    )
  );
}
