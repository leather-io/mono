import { useFormContext } from 'react-hook-form';

import { z } from 'zod';

import { Box, Numpad } from '@leather.io/ui/native';

import { useSendFormContext } from '../send-form-context';

export function SendFormNumpad() {
  const { schema } = useSendFormContext();
  const { setValue, watch } = useFormContext<z.infer<typeof schema>>();
  const amount = watch('amount');

  return (
    <Box mx="-5">
      <Numpad value={amount} onChange={(value: string) => setValue('amount', value)} />
    </Box>
  );
}
