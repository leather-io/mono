import { Controller, useFormContext } from 'react-hook-form';

import { TextInput } from '@/components/text-input';
import { t } from '@lingui/macro';
import { z } from 'zod';

import { useSendFormContext } from '../send-form-context';

export function SendFormAmountField() {
  const { schema } = useSendFormContext();
  const {
    control,
    // TODO: Handle errors
    // formState: { errors },
  } = useFormContext<z.infer<typeof schema>>();

  return (
    <Controller
      control={control}
      name="amount"
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          editable={false}
          height={84}
          inputState="default"
          placeholder="0"
          onBlur={onBlur}
          onChangeText={value => onChange(value)}
          value={value}
        />
      )}
      rules={{
        required: t({
          id: 'send-form.amount-field.error.amount-required',
          message: 'Amount is required',
        }),
      }}
    />
  );
}
