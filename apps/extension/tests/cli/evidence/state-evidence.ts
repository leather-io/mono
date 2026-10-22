import type { Page } from '@playwright/test';
import { readPersistedStore } from '@tests/persisted-store';
import { mapValues } from 'remeda';
import { z } from 'zod';

import type { PersistedSliceKey } from '@shared/storage/persist-whitelist';

export interface SessionEvidence {
  encryptionKeyPresent: boolean;
}

export interface StateEvidence {
  slices: Record<string, unknown>;
  session: SessionEvidence;
}

export const redactedValue = '[redacted]';
const softwareKeysSlice: PersistedSliceKey = 'softwareKeys';
const redactedSoftwareKeyFields = new Set(['salt', 'encryptedSecretKey']);

const recordSchema = z.record(z.string(), z.unknown());
const sessionAreaSchema = z.object({ encryptionKey: z.string().optional() });

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

export async function captureState(
  page: Page,
  slices: readonly PersistedSliceKey[]
): Promise<StateEvidence> {
  const store = await readPersistedStore(page);
  const sessionArea = sessionAreaSchema.safeParse(
    await page.evaluate(() => chrome.storage.session.get(['encryptionKey']))
  );
  const encryptionKey = sessionArea.success ? sessionArea.data.encryptionKey : undefined;
  return {
    slices: selectSlices(store, slices),
    session: { encryptionKeyPresent: encryptionKey !== undefined && encryptionKey.length > 0 },
  };
}
