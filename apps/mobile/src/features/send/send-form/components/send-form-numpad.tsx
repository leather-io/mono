import { useController, useFormContext } from 'react-hook-form';

import { z } from 'zod';

import { Box, Numpad } from '@leather.io/ui/native';

import { SendFormBaseContext, useSendFormContext } from '../send-form-context';

export function SendFormNumpad<T extends SendFormBaseContext<T>>() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { formData } = useSendFormContext<T>();
  // TODO: fix implicit any-s
  const { control } = useFormContext<z.infer<typeof formData.schema>>();
  const {
    field: { onChange, value },
  } = useController({ name: 'amount', control });

  return (
    <Box mx="-5">
      <Numpad value={value} onChange={value => onChange(value)} />
    </Box>
  );
}
