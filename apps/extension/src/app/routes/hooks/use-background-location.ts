import { z } from 'zod';

import { useRouteState } from '@app/common/hooks/use-route-state';

const backgroundLocationRouteStateSchema = z
  .object({
    backgroundLocation: z
      .object({
        pathname: z.string(),
        search: z.string().optional(),
        hash: z.string().optional(),
        state: z.unknown(),
        key: z.string().optional(),
      })
      .optional()
      .catch(undefined),
  })
  .nullish()
  .catch(null);

export function useBackgroundLocation() {
  return useRouteState(backgroundLocationRouteStateSchema)?.backgroundLocation;
}
