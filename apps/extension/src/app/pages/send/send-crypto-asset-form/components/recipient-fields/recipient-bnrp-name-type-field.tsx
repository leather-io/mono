import { useEffect, useState } from 'react';

import { useFormikContext } from 'formik';

import { BitcoinSendFormValues } from '@shared/models/form.model';

import { RecipientAddressTypeField } from '@app/pages/send/send-crypto-asset-form/components/recipient-address-type-field';

import { RecipientAddressDisplayer } from './components/recipient-address-displayer';
import { useRecipientBnrpName } from './hooks/use-recipient-bnrp-name';

interface RecipientBnrpNameTypeFieldProps {
  topInputOverlay: React.JSX.Element;
  rightLabel: React.JSX.Element;
}
export function RecipientBnrpNameTypeField({
  topInputOverlay,
  rightLabel,
}: RecipientBnrpNameTypeFieldProps) {
  const [showBnrpAddress, setShowBnrpAddress] = useState(false);
  const { errors, setFieldError, values } = useFormikContext<BitcoinSendFormValues>();
  const { bnrpAddress, getBnrpAddressAndValidate } = useRecipientBnrpName();

  useEffect(() => {
    if (!errors.recipient) {
      if (bnrpAddress) setShowBnrpAddress(true);
      setFieldError('recipientBnrpName', undefined);
    }
    if (values.recipient && errors.recipient) {
      setShowBnrpAddress(false);
      setFieldError('recipientBnrpName', errors.recipient);
    }
  }, [bnrpAddress, errors.recipient, setFieldError, values.recipient]);

  return (
    <>
      <RecipientAddressTypeField
        name="recipientBnrpName"
        onBlur={getBnrpAddressAndValidate}
        placeholder="Enter Bitcoin name (e.g. satoshi.btc)"
        topInputOverlay={topInputOverlay}
        rightLabel={rightLabel}
      />
      {showBnrpAddress ? <RecipientAddressDisplayer address={bnrpAddress} /> : null}
    </>
  );
}
