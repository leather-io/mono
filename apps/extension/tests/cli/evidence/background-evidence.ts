import type { BrowserContext } from '@playwright/test';
import { z } from 'zod';

import { backgroundErrorsStorageKey } from '@shared/storage/background-errors';

const backgroundErrorsSchema = z.array(z.object({ ts: z.string(), message: z.string() }));

export type BackgroundError = z.infer<typeof backgroundErrorsSchema>[number];

export async function readBackgroundErrors(context: BrowserContext): Promise<BackgroundError[]> {
  const [worker] = context.serviceWorkers();
  if (worker === undefined) return [];
  const stored = await worker.evaluate(async key => {
    const area = await chrome.storage.session.get([key]);
    const value: unknown = area[key];
    return value;
  }, backgroundErrorsStorageKey);
  const parsed = backgroundErrorsSchema.safeParse(stored);
  if (!parsed.success) return [];
  return parsed.data;
}
