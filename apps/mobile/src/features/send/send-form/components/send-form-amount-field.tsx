import { Controller, useFormContext } from 'react-hook-form';

import { TextInput } from '@/components/text-input';
import { z } from 'zod';

import { SendFormBaseContext, useSendFormContext } from '../send-form-context';

export function SendFormAmountField<T extends SendFormBaseContext<T>>() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { formData } = useSendFormContext<T>();
  const {
    control,
    // TODO: Handle errors
    // formState: { errors },
  } = useFormContext<z.infer<typeof formData.schema>>();

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
    />
  );
}
