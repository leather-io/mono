import { z } from 'zod';

import { useRouteState } from '@app/common/hooks/use-route-state';

const sendFormRouteStateSchema = z
  .object({
    amount: z.union([z.number(), z.string()]).optional(),
    recipient: z.string().optional(),
  })
  .nullish()
  .catch(null);

export function useSendFormRouteState() {
  const state = useRouteState(sendFormRouteStateSchema);
  return {
    amount: state?.amount ?? '',
    recipient: state?.recipient ?? '',
  };
}
