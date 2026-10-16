import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { entries } from 'remeda';

import type { RecipientFormValues } from '@shared/models/form.model';
import { RouteUrls } from '@shared/route-urls';

import { useRecipientBnsName } from './use-recipient-bns-name';

const recipientIdentifierTypesMap = { address: 'Address', bnsName: 'BNS Name' } as const;

export type RecipientIdentifierType = keyof typeof recipientIdentifierTypesMap;

function makeIteratbleListOfRecipientIdentifierTypes(
  recipientTypeMap: typeof recipientIdentifierTypesMap
) {
  return entries(recipientTypeMap).map(([key, value]) => ({ key, label: value }));
}
export const recipientIdentifierTypes = makeIteratbleListOfRecipientIdentifierTypes(
  recipientIdentifierTypesMap
);

export function useRecipientSelectFields() {
  const { resetField } = useFormContext<RecipientFormValues>();

  const [selectedRecipientField, setSelectedRecipientField] =
    useState<RecipientIdentifierType>('address');

  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const { setBnsAddress } = useRecipientBnsName();
  const navigate = useNavigate();

  const resetAllRecipientFields = useCallback(() => {
    resetField('recipient', { defaultValue: '' });
    resetField('recipientBnsName', { defaultValue: '' });
  }, [resetField]);

  return useMemo(
    () => ({
      selectedRecipientField,

      selectedRecipientFieldName: recipientIdentifierTypesMap[selectedRecipientField],

      isSelectVisible,

      showRecipientAccountsModal() {
        setSelectedRecipientField('address');
        void navigate(RouteUrls.SendCryptoAssetFormRecipientAccounts, { replace: true });
      },

      onSelectRecipientFieldType(recipientType: RecipientIdentifierType) {
        resetAllRecipientFields();
        setBnsAddress('');
        setSelectedRecipientField(recipientType);
        setIsSelectVisible(false);
      },

      onSetIsSelectVisible(value: boolean) {
        resetAllRecipientFields();
        setIsSelectVisible(value);
      },
    }),
    [isSelectVisible, navigate, resetAllRecipientFields, selectedRecipientField, setBnsAddress]
  );
}
