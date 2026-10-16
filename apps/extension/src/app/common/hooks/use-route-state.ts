import { useLocation } from 'react-router';

import type { z } from 'zod';

export function useRouteState<T>(schema: z.ZodType<T>): T {
  return schema.parse(useLocation().state);
}
