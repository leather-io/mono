import { type FormEvent, memo } from 'react';
import { useController } from 'react-hook-form';

import { Stack, type StackProps } from 'leather-styles/jsx';

import { Input } from '@leather.io/ui';

import { ErrorLabel } from '@app/components/error-label';

interface EditNonceFieldProps extends StackProps {
  onBlur(): void;
}

export const EditNonceField = memo(function EditNonceField(props: EditNonceFieldProps) {
  const { onBlur } = props;
  const { field, fieldState } = useController<{ nonce?: number | string }>({ name: 'nonce' });
  const error = fieldState.error?.message;

  return (
    <Stack width="100%" {...props}>
      <Input.Root data-has-error={error}>
        <Input.Label>Custom nonce</Input.Label>
        <Input.Field
          name={field.name}
          ref={field.ref}
          onBlur={onBlur}
          value={field.value}
          onChange={(evt: FormEvent<HTMLInputElement>) => {
            field.onChange(evt.currentTarget.value);
          }}
        />
      </Input.Root>
      {error && <ErrorLabel>{error}</ErrorLabel>}
    </Stack>
  );
});
