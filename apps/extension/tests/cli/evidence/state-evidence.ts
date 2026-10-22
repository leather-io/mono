import type { Page } from '@playwright/test';
import { readPersistedStore } from '@tests/persisted-store';
import { mapValues } from 'remeda';
import { z } from 'zod';

import type { PersistedSliceKey } from '@shared/storage/persist-whitelist';

export interface SessionEvidence {
  encryptionKeyPresent: boolean;
}

const queryRecordSchema = z.object({
  queryKey: z.unknown(),
  status: z.string(),
  fetchStatus: z.string(),
  dataUpdatedAt: z.number(),
});

export type QueryRecord = z.infer<typeof queryRecordSchema>;

export interface QueryCacheSummary {
  count: number;
  byStatus: Record<string, number>;
}

export interface StateEvidence {
  slices: Record<string, unknown>;
  session: SessionEvidence;
  location: string | null;
  queries: QueryRecord[] | null;
}

export const redactedValue = '[redacted]';
const softwareKeysSlice: PersistedSliceKey = 'softwareKeys';
const redactedSoftwareKeyFields = new Set(['salt', 'encryptedSecretKey']);

const recordSchema = z.record(z.string(), z.unknown());
const sessionAreaSchema = z.object({ encryptionKey: z.string().optional() });
const queriesSchema = z.array(queryRecordSchema).nullable();

export function redactSoftwareKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSoftwareKeys);
  const record = recordSchema.safeParse(value);
  if (!record.success) return value;
  return mapValues(record.data, (fieldValue, key) => {
    if (redactedSoftwareKeyFields.has(key)) return redactedValue;
    return redactSoftwareKeys(fieldValue);
  });
}

export function selectSlices(
  store: Record<string, unknown> | undefined,
  slices: readonly PersistedSliceKey[]
): Record<string, unknown> {
  const selected: Record<string, unknown> = {};
  for (const slice of slices) {
    const value = store?.[slice];
    if (value === undefined) {
      selected[slice] = null;
      continue;
    }
    if (slice === softwareKeysSlice) {
      selected[slice] = redactSoftwareKeys(value);
      continue;
    }
    selected[slice] = value;
  }
  return selected;
}

export function summarizeQueries(queries: readonly QueryRecord[] | null): QueryCacheSummary | null {
  if (queries === null) return null;
  const byStatus: Record<string, number> = {};
  for (const query of queries) byStatus[query.status] = (byStatus[query.status] ?? 0) + 1;
  return { count: queries.length, byStatus };
}

async function readDebugSnapshot(page: Page) {
  const snapshot = await page.evaluate(() => {
    const location =
      typeof window.debug.getRouterLocation === 'function'
        ? window.debug.getRouterLocation()
        : null;
    const queries =
      typeof window.debug.getQueryCacheSummary === 'function'
        ? window.debug.getQueryCacheSummary()
        : null;
    return { location, queries };
  });
  const queries = queriesSchema.safeParse(snapshot.queries);
  return { location: snapshot.location, queries: queries.success ? queries.data : null };
}

export async function captureState(
  page: Page,
  slices: readonly PersistedSliceKey[]
): Promise<StateEvidence> {
  const store = await readPersistedStore(page);
  const sessionArea = sessionAreaSchema.safeParse(
    await page.evaluate(() => chrome.storage.session.get(['encryptionKey']))
  );
  const encryptionKey = sessionArea.success ? sessionArea.data.encryptionKey : undefined;
  const { location, queries } = await readDebugSnapshot(page);
  return {
    slices: selectSlices(store, slices),
    session: { encryptionKeyPresent: encryptionKey !== undefined && encryptionKey.length > 0 },
    location,
    queries,
  };
}
