import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import type { RecipientFormValues } from '@shared/models/form.model';

import { RecipientAddressTypeField } from '@app/pages/send/send-crypto-asset-form/components/recipient-address-type-field';

import { RecipientAddressDisplayer } from './components/recipient-address-displayer';
import { useRecipientBnsName } from './hooks/use-recipient-bns-name';

interface RecipientBnsNameTypeFieldProps {
  fetchFn(name: string): Promise<string | null>;
  topInputOverlay: React.JSX.Element;
  rightLabel: React.JSX.Element;
}
export function RecipientBnsNameTypeField({
  fetchFn,
  topInputOverlay,
  rightLabel,
}: RecipientBnsNameTypeFieldProps) {
  const [showBnsAddress, setShowBnsAddress] = useState(false);
  const {
    clearErrors,
    formState: { errors },
    setError,
    watch,
  } = useFormContext<RecipientFormValues>();
  const recipient = watch('recipient');
  const recipientError = errors.recipient?.message;
  const { bnsAddress, getBnsAddressAndValidate } = useRecipientBnsName();

  // Apply the recipient field validation to the bns name field
  // here so we don't need to validate the bns name on blur.
  // Bns name validation occurs in the hook handling the lookup.
  // This allows us to have just one field handling the recipient
  // address for generating the unsigned transaction.
  useEffect(() => {
    if (!recipientError) {
      if (bnsAddress) setShowBnsAddress(true);
      clearErrors('recipientBnsName');
    }
    if (recipient && recipientError) {
      setShowBnsAddress(false);
      setError('recipientBnsName', { message: recipientError });
    }
  }, [bnsAddress, clearErrors, recipient, recipientError, setError]);

  return (
    <>
      <RecipientAddressTypeField
        name="recipientBnsName"
        onBlur={() => void getBnsAddressAndValidate(fetchFn)}
        placeholder="Enter recipient BNS name"
        topInputOverlay={topInputOverlay}
        rightLabel={rightLabel}
      />
      {showBnsAddress ? <RecipientAddressDisplayer address={bnsAddress} /> : null}
    </>
  );
}
