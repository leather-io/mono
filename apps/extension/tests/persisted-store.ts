import type { Page } from '@playwright/test';
import { z } from 'zod';

const persistedStoreSnapshotSchema = z.looseObject({
  wallets: z.looseObject({ ids: z.array(z.string()).optional() }).optional(),
  accounts: z
    .looseObject({
      ids: z.array(z.string()).optional(),
      entities: z
        .record(
          z.string(),
          z.looseObject({ name: z.string().optional(), status: z.string().optional() }).optional()
        )
        .optional(),
    })
    .optional(),
  active: z
    .looseObject({
      account: z
        .looseObject({ fingerprint: z.string(), accountIndex: z.number() })
        .nullable()
        .optional(),
      activePolicyId: z.string().nullable().optional(),
    })
    .optional(),
  chains: z
    .looseObject({
      stx: z
        .record(
          z.string(),
          z.looseObject({ highestAccountIndex: z.number().optional() }).optional()
        )
        .optional(),
    })
    .optional(),
  policy: z.looseObject({ ids: z.array(z.string()).optional() }).optional(),
});

export async function readPersistedStore(page: Page) {
  const store = await page.evaluate(() => window.debug.getPersistedStore());
  if (store === undefined || store === null) return undefined;
  return persistedStoreSnapshotSchema.parse(store);
}
