import { z } from 'zod';

import { useRouteState } from '@app/common/hooks/use-route-state';

const sendFormRouteStateSchema = z
  .object({
    amount: z.union([z.number(), z.string()]).optional(),
    recipient: z.string().optional(),
    recipientBnsName: z.string().optional(),
    memo: z.string().optional(),
    fee: z.union([z.number(), z.string()]).optional(),
    feeCurrency: z.string().optional(),
    feeType: z.string().optional(),
    nonce: z.union([z.number(), z.string()]).optional(),
  })
  .nullish()
  .catch(null);

export function useSendFormRouteState() {
  const {
    amount = '',
    recipient = '',
    ...restoredValues
  } = useRouteState(sendFormRouteStateSchema) ?? {};
  return { amount, recipient, ...restoredValues };
}
