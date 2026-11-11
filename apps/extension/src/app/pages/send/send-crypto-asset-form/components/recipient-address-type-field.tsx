import { useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Box } from 'leather-styles/jsx';

import { Input } from '@leather.io/ui';

import type { RecipientFieldName, RecipientFormValues } from '@shared/models/form.model';

interface RecipientAddressTypeFieldProps {
  label?: string;
  name: RecipientFieldName;
  onBlur?(): void;
  placeholder: string;
  topInputOverlay?: React.JSX.Element;
  rightLabel?: React.JSX.Element;
}
export function RecipientAddressTypeField({
  name,
  topInputOverlay,
  rightLabel,
  onBlur,
  placeholder,
}: RecipientAddressTypeFieldProps) {
  const { field } = useController<RecipientFormValues, RecipientFieldName>({ name });
  const { setValue } = useFormContext<RecipientFormValues>();

  useEffect(() => {
    const trimmedValue = field.value.trim();
    if (trimmedValue !== field.value) setValue(name, trimmedValue);
  }, [name, field.value, setValue]);

  return (
    <Box width="100%" position="relative" mb="space.02">
      <Input.Root shrink>
        {rightLabel && (
          <Box pos="absolute" right="space.03" zIndex={15} top="9px">
            {rightLabel}
          </Box>
        )}
        {topInputOverlay && <Input.Label>{topInputOverlay}</Input.Label>}
        <Input.Field
          data-testid={SendCryptoAssetSelectors.RecipientFieldInput}
          placeholder={placeholder}
          name={field.name}
          ref={field.ref}
          value={field.value}
          onChange={field.onChange}
          onBlur={() => {
            field.onBlur();
            onBlur?.();
          }}
        />
      </Input.Root>
    </Box>
  );
}
