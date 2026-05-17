import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { useFormikContext } from 'formik';

import type { Entries } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';

import { useRecipientBnsName } from './use-recipient-bns-name';
import { useRecipientBnrpName } from './use-recipient-bnrp-name';

const recipientIdentifierTypesMap = {
  address: 'Address',
  bnsName: 'BNS Name',
  bnrpName: 'Bitcoin Name',
} as const;

export type RecipientIdentifierType = keyof typeof recipientIdentifierTypesMap;

function makeIteratbleListOfRecipientIdentifierTypes(
  recipientTypeMap: typeof recipientIdentifierTypesMap
) {
  return (Object.entries(recipientTypeMap) as Entries<typeof recipientTypeMap>).map(
    ([key, value]) => ({ key, label: value })
  );
}
export const recipientIdentifierTypes = makeIteratbleListOfRecipientIdentifierTypes(
  recipientIdentifierTypesMap
);

export function useRecipientSelectFields() {
  const { setFieldError, setFieldTouched, setFieldValue } = useFormikContext();

  const [selectedRecipientField, setSelectedRecipientField] =
    useState<RecipientIdentifierType>('address');

  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const { setBnsAddress } = useRecipientBnsName();
  const { setBnrpAddress } = useRecipientBnrpName();
  const navigate = useNavigate();

  const resetAllRecipientFields = useCallback(async () => {
    void setFieldValue('recipient', '');
    setFieldError('recipient', undefined);
    await setFieldTouched('recipient', false);
    void setFieldValue('recipientBnsName', '');
    setFieldError('recipientBnsName', undefined);
    await setFieldTouched('recipientBnsName', false);
    void setFieldValue('recipientBnrpName', '');
    setFieldError('recipientBnrpName', undefined);
    await setFieldTouched('recipientBnrpName', false);
  }, [setFieldValue, setFieldError, setFieldTouched]);

  return useMemo(
    () => ({
      selectedRecipientField,

      selectedRecipientFieldName: recipientIdentifierTypesMap[selectedRecipientField],

      isSelectVisible,

      showRecipientAccountsModal() {
        setSelectedRecipientField('address');
        void navigate(RouteUrls.SendCryptoAssetFormRecipientAccounts, { replace: true });
      },

      async onSelectRecipientFieldType(recipientType: RecipientIdentifierType) {
        await resetAllRecipientFields();
        setBnsAddress('');
        setBnrpAddress('');
        setSelectedRecipientField(recipientType);
        setIsSelectVisible(false);
      },

      async onSetIsSelectVisible(value: boolean) {
        await resetAllRecipientFields();
        setIsSelectVisible(value);
      },
    }),
    [isSelectVisible, navigate, resetAllRecipientFields, selectedRecipientField, setBnsAddress, setBnrpAddress]
  );
}
