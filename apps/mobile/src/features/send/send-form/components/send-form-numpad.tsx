import { useFormContext } from 'react-hook-form';

import { z } from 'zod';

import { Box, Numpad } from '@leather.io/ui/native';

import { SendFormBaseContext, useSendFormContext } from '../send-form-context';

export function SendFormNumpad<T extends SendFormBaseContext<T>>() {
  const { formData } = useSendFormContext<T>();
  const { setValue, watch } = useFormContext<z.infer<typeof formData.schema>>();
  const amount = watch('amount');

  return (
    <Box mx="-5">
      <Numpad value={amount} onChange={(value: string) => setValue('amount', value)} />
    </Box>
  );
}
