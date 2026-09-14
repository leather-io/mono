import { useCallback, useState } from 'react';

import { useFormikContext } from 'formik';

import { FormErrorMessages } from '@shared/error-messages';
import { logger } from '@shared/logger';
import { BitcoinSendFormValues, StacksSendFormValues } from '@shared/models/form.model';

import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

// Handles validating the BNS name lookup
export function useRecipientBnsName() {
  const { setFieldError, setFieldValue, values } = useFormikContext<
    BitcoinSendFormValues | StacksSendFormValues
  >();
  const [bnsAddress, setBnsAddress] = useState('');

  const currentStacksAddress = useCurrentStacksAccountAddress();

  const getBnsAddressAndValidate = useCallback(
    async (fetchFn: (name: string) => Promise<string | null>) => {
      setBnsAddress('');
      if (!values.recipientBnsName) return;

      try {
        const owner = await fetchFn(values.recipientBnsName);

        if (owner) {
          if (owner === currentStacksAddress) {
            setFieldError('recipientBnsName', FormErrorMessages.SameAddress);
            return;
          }

          setBnsAddress(owner);
          setFieldError('recipient', undefined);
          await setFieldValue('recipient', owner);
        } else {
          setFieldError('recipientBnsName', FormErrorMessages.BnsAddressNotFound);
        }
      } catch (e) {
        setFieldError('recipientBnsName', FormErrorMessages.BnsAddressNotFound);
        logger.error('Error fetching bns address', e);
      }
    },
    [currentStacksAddress, setFieldError, setFieldValue, values.recipientBnsName]
  );

  return { bnsAddress, getBnsAddressAndValidate, setBnsAddress };
}
